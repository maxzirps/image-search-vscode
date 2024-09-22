import * as vscodeModule from "vscode";

export const setPixabayApiKeyCommand = (
  vscode: typeof vscodeModule,
  outputChannel: vscodeModule.OutputChannel
) =>
  vscode.commands.registerCommand("image-search.setPixabayAPIKey", async () => {
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
        .then(() => outputChannel.appendLine(`Setting updated successfully!`));
    } else {
      config.update(
        "image-search.pixabayAPIKey",
        undefined,
        vscode.ConfigurationTarget.Global
      );
    }
  });
