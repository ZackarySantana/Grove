import { exec } from "child_process";
import { copyFile, downloadDiffFile, showError } from "../pkg/utils";
import { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initOpenDiff(context: GroveContext) {
    return async (path: string, link: string) => {
        const openPath = vscode.Uri.joinPath(context.workspaceFolder.uri, path);

        downloadDiffFile(context, link, path, async (diffFilePath: string) => {
            copyFile(openPath.fsPath, async (clonePath: string) => {
                exec(
                    `patch -p1 ${clonePath} ${diffFilePath} -f`,
                    {
                        cwd: context.workspaceFolder.uri.path,
                    },
                    (err, stdout, stderr) => {
                        console.log("stdout: " + stdout);
                        console.log("stderr: " + stderr);
                        if (err) {
                            showError(`We could not apply those diffs. ${err}`);
                            return;
                        }
                        vscode.commands.executeCommand(
                            "vscode.diff",
                            openPath,
                            vscode.Uri.file(clonePath),
                            null,
                            {
                                preview: true,
                            } as vscode.TextDocumentShowOptions,
                        );
                    },
                );
            });
        });
    };
}
