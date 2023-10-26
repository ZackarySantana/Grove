import * as vscode from "vscode";

export function initOpenLink() {
    return async (link: string) => {
        vscode.env.openExternal(vscode.Uri.parse(link));
    };
}
