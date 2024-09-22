import path from "path";
import * as vscodeModule from "vscode";
import { downloadFile } from "../utils/download-file";
import { getWebviewContent } from "../view/get-webview-content";

export const searchImageCommand = (
  vscode: typeof vscodeModule,
  outputChannel: vscodeModule.OutputChannel,
  context: vscodeModule.ExtensionContext
) =>
  vscode.commands.registerCommand("image-search.searchImage", async () => {
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

    let imageResolution: string | undefined = vscode.workspace
      .getConfiguration("image-search")
      .get("downloadedImageResolution");

    if (!imageResolution) {
      vscode.window.showWarningMessage(
        "No downloadedImageResolution setting found. Defaulting to webformat."
      );
      imageResolution = "webformat";
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
          )}&image_type=photo&per_page=50&safesearch=true`
        );
        if (res.headers.get("content-type")?.includes("application/json")) {
          const data: any = await res.json();
          if (
            ["fullHD", "image"].includes(imageResolution) &&
            !Object.keys(data.hits[0]).includes("fullHDURL")
          ) {
            vscode.window.showWarningMessage(
              `You set 'downloadedImageResolution' to ${imageResolution} but don't have full access to the API. Changing settings to 'largeImage'.`
            );
            vscode.workspace
              .getConfiguration()
              .update(
                "image-search.downloadedImageResolution",
                "largeImage",
                vscode.ConfigurationTarget.Global
              );
            imageResolution = "largeImage";
          }
          const imgEntries: {
            previewURL: string;
            imageURL: string;
          }[] = data.hits.map((entry: any) => ({
            previewURL: entry.previewURL,
            imageURL: entry[imageResolution + "URL"],
          }));

          if (imgEntries.length === 0) {
            vscode.window.showWarningMessage(
              `No results found for ${searchString}`
            );
            return;
          }
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
                panel.dispose();
                const fileUrl = message.imageUrl;
                const fileType = message.imageUrl.split(".").pop();
                const fileName =
                  searchString.replaceAll(" ", "-") + "." + fileType;
                const workspaceFolder =
                  vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

                if (workspaceFolder) {
                  const filePath = path.join(workspaceFolder, fileName);
                  try {
                    await downloadFile(fileUrl, filePath);
                    outputChannel.append(
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
  });
