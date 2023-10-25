import * as vscode from "vscode";

export function initCopyText() {
    return async (text: string) => {
        vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage(`Copied: ${text}`);
    };
}
