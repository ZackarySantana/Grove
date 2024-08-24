import { exec } from "child_process";
import { showError, applyGitDiffs } from "../pkg/utils";
import { GroveContext } from "src/types";
import { window } from "vscode";

// this.patch.module_code_changes.flatMap((p) =>
//     p.file_diffs.flatMap(
//         (s) =>
//             new PatchChild(this.context, s.file_name, [
//                 this.createOpenFileChild("Open File", s.file_name),
//                 new PatchChild(
//                     this.context,
//                     `Additions: ${s.additions}`,
//                 ),
//                 new PatchChild(
//                     this.context,
//                     `Deletions: ${s.deletions}`,
//                 ),
//             ]),
//     ),
// ),

export function initCheckoutPatch(context: GroveContext) {
    return async (patchId: string) => {
        window.showInformationMessage(`Checking out for patch ${patchId}`);
        const [patch, err] =
            await context.evergreen.clients.v2.getPatch(patchId);
        if (err !== undefined) {
            showError(`There was a problem getting that patch: ${err}`);
            return;
        }
        if (patch === undefined) {
            showError(`That patch does not exist.`);
            return;
        }
        let hash = patch.git_hash;
        if (patch.github_patch_data.head_hash !== "") {
            hash = patch.github_patch_data.head_hash;
        }
        console.log(patch);

        exec(
            `git fetch --all && git stash && git checkout ${hash}`,
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
                    return;
                }
                // For PR patches, there are no code changes.
                if (patch.github_patch_data.head_hash !== "") {
                    return;
                }
                applyGitDiffs(
                    context,
                    patch.module_code_changes.map((p) => p.raw_link),
                );
                window.showInformationMessage(`Checked out ${patchId}`);
            },
        );
    };
}
