import { Either } from "src/types";
import * as vscode from "vscode";

export function getWorkspaceFolder(): Either<vscode.WorkspaceFolder, Error> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.at(0);
    if (!workspaceFolder) {
        return [undefined, new Error("No workspace is opened")];
    }
    return [workspaceFolder, undefined];
}

export function showError(err: Error | string) {
    if (err instanceof Error) {
        vscode.window.showErrorMessage(err.message);
        console.error(err.message);
        return;
    }
    vscode.window.showErrorMessage(err);
    console.error(err);
}
