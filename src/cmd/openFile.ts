import { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initOpenFile(context: GroveContext) {
    return async (path: string) => {
        const openPath = vscode.Uri.joinPath(context.workspaceFolder.uri, path);
        vscode.workspace.openTextDocument(openPath).then((doc) => {
            vscode.window.showTextDocument(doc);
        });
    };
}
