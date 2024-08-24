/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import { showError } from "../pkg/utils";
import { getConfig } from "../pkg/config";
import type { GroveContext } from "src/types";
import * as vscode from "vscode";
import { exec } from "child_process";

export function initCreatePatch(context: GroveContext): () => void {
    return async () => {
        const [customPatches, err] = getConfig("customPatches");
        if (err) {
            showError(err);
            return;
        }
        if (customPatches.length > 0) {
            const useCustomPatch = await vscode.window.showQuickPick(
                [
                    {
                        label: "Yes",
                        value: true,
                    },
                    {
                        label: "No",
                        value: false,
                    },
                ],
                { placeHolder: "Use custom patch commands in config?" },
            );
            if (!useCustomPatch) {
                return;
            }
            if (useCustomPatch.value) {
                const options = customPatches.map((p) => ({
                    label: p.label,
                    value: p.command,
                    description: p.command,
                }));
                const cmd = await vscode.window.showQuickPick(options, {
                    placeHolder: "Which custom patch would you like to use?",
                });
                if (!cmd) {
                    return;
                }
                let command = cmd.value + " -y";
                if (
                    !command.includes(" -d ") &&
                    !command.includes(" --description ") &&
                    !command.includes(" -ad ") &&
                    !command.includes(" --auto-description ")
                ) {
                    command += " -ad";
                }
                let finished = false;

                vscode.window.showInformationMessage("Creating patch...");
                exec(
                    command,
                    { cwd: context.workspaceFolder.uri.path },
                    (err, stdout, stderr) => {
                        console.log(`stdout: ${stdout}`);
                        console.log(`stderr: ${stderr}`);
                        finished = true;
                        if (err) {
                            showError("Patch command failed.");
                            showError(err);
                            return;
                        }
                        vscode.window.showInformationMessage(
                            "Created patch, refreshing views",
                        );
                        context.views.recent_patches.refresh();
                        context.views.project_patches.refresh();
                        context.views.open_patches.refresh();
                    },
                );
                setTimeout(() => {
                    if (!finished) {
                        showError(
                            "Are you sure your patch command is configured to finish",
                        );
                    }
                }, 5000);
                return;
            }
        }
        let command = "evergreen patch -y";
        const useUncommitted = await vscode.window.showQuickPick(
            [
                {
                    label: "Yes",
                    value: true,
                },
                {
                    label: "No",
                    value: false,
                },
            ],
            { placeHolder: "Use uncommitted changes?" },
        );
        if (!useUncommitted) {
            return;
        }
        if (useUncommitted.value) {
            command += " -u";
        }
        const autoDescription = await vscode.window.showQuickPick(
            [
                {
                    label: "Yes",
                    value: true,
                },
                {
                    label: "No",
                    value: false,
                },
            ],
            { placeHolder: "Use last commit message as description?" },
        );
        if (!autoDescription) {
            return;
        }
        if (autoDescription.value) {
            command += " -ad";
        } else {
            const description = await vscode.window.showInputBox({
                placeHolder: "Patch description here",
            });
            if (!description) {
                return;
            }
            command += ` -d '${description}'`;
        }
        vscode.window.showInformationMessage("Creating patch...");
        exec(
            command,
            { cwd: context.workspaceFolder.uri.path },
            (err, stdout, stderr) => {
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                if (err) {
                    showError("Patch command failed.");
                    showError(err);
                    return;
                }
                vscode.window.showInformationMessage(
                    "Created patch, refreshing views",
                );
                context.views.recent_patches.refresh();
                context.views.project_patches.refresh();
                context.views.open_patches.refresh();
            },
        );
        return;
    };
}
