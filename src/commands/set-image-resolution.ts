import * as vscodeModule from "vscode";

export const setImageResolutionCommand = (
  vscode: typeof vscodeModule,
  outputChannel: vscodeModule.OutputChannel
) =>
  vscode.commands.registerCommand(
    "image-search.setImageResolution",
    async () => {
      const options = [
        {
          label: "Web Format",
          description:
            "Medium sized image with a maximum width or height of 640 px",
          value: "webformat",
        },
        {
          label: "Large Image",
          description: "Scaled image with a maximum width/height of 1280px",
          value: "largeImage",
        },
        {
          label: "Full HD",
          description:
            "Full HD scaled image with a maximum width/height of 1920px [Needs full API access]",
          value: "fullHD",
        },
        {
          label: "Original Image",
          description: "URL to the original image [Needs full API access]",
          value: "image",
        },
      ];

      const selectedOption = await vscode.window.showQuickPick(options, {
        placeHolder: "Select image resolution",
      });

      if (selectedOption) {
        const config = vscode.workspace.getConfiguration();
        config
          .update(
            "image-search.downloadedImageResolution",
            selectedOption.value,
            vscode.ConfigurationTarget.Global
          )
          .then(() =>
            outputChannel.appendLine(
              `Resolution set to: ${selectedOption.label}`
            )
          );
      }
    }
  );
