import * as vscode from "vscode";
import { setPixabayApiKeyCommand } from "./commands/set-pixabay-api-key";
import { searchImageCommand } from "./commands/search-image";
import { setImageResolutionCommand } from "./commands/set-image-resolution";

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("Image Search");

  context.subscriptions.push(setPixabayApiKeyCommand(vscode, outputChannel));
  context.subscriptions.push(setImageResolutionCommand(vscode, outputChannel));
  context.subscriptions.push(
    searchImageCommand(vscode, outputChannel, context)
  );
}

export function deactivate() {}
