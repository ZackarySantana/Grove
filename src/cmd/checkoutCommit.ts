import { exec } from "child_process";
import { showError } from "../pkg/utils";
import { GroveContext } from "src/types";
import { window } from "vscode";

export function initCheckoutCommit(context: GroveContext) {
    return async (commitHash: string) => {
        window.showInformationMessage(`Checking out ${commitHash}`);
        exec(
            `git fetch --all && git checkout ${commitHash}`,
            {
                cwd: context.workspaceFolder.uri.path,
            },
            (err, stdout, stderr) => {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
                if (err) {
                    showError(
                        `We could not checkout that commit, are you in the right project? ${err}`,
                    );
                } else {
                    window.showInformationMessage(`Checked out ${commitHash}`);
                }
            },
        );
    };
}
