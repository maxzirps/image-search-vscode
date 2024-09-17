import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "image-search.setUnsplashAPIKey",
    async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: "Enter your Unsplash API Key",
      });
      const config = vscode.workspace.getConfiguration();

      if (apiKey) {
        config
          .update(
            "image-search.unsplashAPIKey",
            apiKey,
            vscode.ConfigurationTarget.Global
          )
          .then(
            () => {
              vscode.window.showInformationMessage(
                `Setting updated successfully!`
              );
            },
            (error) => {
              vscode.window.showErrorMessage(
                `Failed to update setting: ${error}`
              );
            }
          );
      } else {
        config.update(
          "image-search.unsplashAPIKey",
          undefined,
          vscode.ConfigurationTarget.Global
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
