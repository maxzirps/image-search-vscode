import * as vscode from "vscode";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("Image Search");

  const setPixabayApiKeyCommand = vscode.commands.registerCommand(
    "image-search.setPixabayAPIKey",
    async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: "Enter your Pixabay API Key",
      });
      const config = vscode.workspace.getConfiguration();
      if (apiKey) {
        config
          .update(
            "image-search.pixabayAPIKey",
            apiKey,
            vscode.ConfigurationTarget.Global
          )
          .then(() =>
            vscode.window.showInformationMessage(
              `Setting updated successfully!`
            )
          );
      } else {
        config.update(
          "image-search.pixabayAPIKey",
          undefined,
          vscode.ConfigurationTarget.Global
        );
      }
    }
  );

  const searchImageCommand = vscode.commands.registerCommand(
    "image-search.searchImage",
    async () => {
      const apiKey = vscode.workspace
        .getConfiguration("image-search")
        .get("pixabayAPIKey");
      if (!apiKey) {
        vscode.window
          .showErrorMessage("Please set an API-Key first.", "Set API Key")
          .then((selection) => {
            if (selection === "Set API Key") {
              vscode.commands.executeCommand("image-search.setPixabayAPIKey");
            }
          });
        return;
      }

      const searchString = await vscode.window.showInputBox({
        placeHolder: "What image are you looking for?",
        prompt: "Image description",
      });

      if (searchString) {
        try {
          const res = await fetch(
            `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
              searchString
            )}&image_type=photo`
          );
          if (res.headers.get("content-type")?.includes("application/json")) {
            const data: any = await res.json();
            const imgEntries = data.hits.map((entry: any) => ({
              previewURL: entry.previewURL,
              webformatURL: entry.webformatURL,
            }));

            const panel = vscode.window.createWebviewPanel(
              "imageViewer",
              "Image Search: Results",
              vscode.ViewColumn.One,
              { enableScripts: true }
            );

            panel.webview.html = getWebviewContent(imgEntries);

            panel.webview.onDidReceiveMessage(
              async (message) => {
                if (message.command === "imageClicked") {
                  const fileUrl = message.imageUrl;
                  const fileName = message.imageUrl.split("/").pop();
                  const workspaceFolder =
                    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

                  if (workspaceFolder) {
                    const filePath = path.join(workspaceFolder, fileName);
                    try {
                      await downloadFile(fileUrl, filePath);
                      vscode.window.showInformationMessage(
                        `File downloaded and saved to ${filePath}`
                      );
                    } catch (error: any) {
                      vscode.window.showErrorMessage(
                        `Failed to download file: ${error.message}`
                      );
                    }
                  } else {
                    vscode.window.showErrorMessage(
                      "No workspace folder is open."
                    );
                  }
                  panel.dispose();
                }
              },
              undefined,
              context.subscriptions
            );
          } else {
            throw new Error(await res.text());
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(
            "Something went wrong fetching the image. " + err
          );
          outputChannel.append(err);
        }
      }
    }
  );

  context.subscriptions.push(setPixabayApiKeyCommand);
  context.subscriptions.push(searchImageCommand);
}

function downloadFile(url: string, filePath: string): Promise<void> {
  return new Promise((resolve: any, reject) => {
    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get file: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
        file.on("error", (err) => {
          fs.unlink(filePath, () => reject(err));
        });
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => reject(err));
      });
  });
}

function getWebviewContent(
  imageEntries: { previewURL: string; webformatURL: string }[]
): string {
  const imageElements = imageEntries
    .map(
      (entry) =>
        `<img src="${entry.previewURL}" class="image-item" data-url="${entry.previewURL}" data-web-format-url="${entry.webformatURL}" style="width:200px;height:auto;margin:10px;cursor:pointer;" />`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        .image-item {
          border: 2px solid #ccc;
          transition: transform 0.2s;
        }
        .image-item:hover {
          transform: scale(1.1);
        }
      </style>
    </head>
    <body>
      <div style="display: flex; flex-wrap: wrap;">
        ${imageElements}
      </div>
      <script>
        const images = document.querySelectorAll('.image-item');
        images.forEach(img => {
          img.addEventListener('click', event => {
            const imageUrl = event.target.getAttribute('data-web-format-url');
            vscode.postMessage({
              command: 'imageClicked',
              imageUrl: imageUrl
            });
          });
        });
        const vscode = acquireVsCodeApi();
      </script>
    </body>
    </html>
  `;
}

export function deactivate() {}
