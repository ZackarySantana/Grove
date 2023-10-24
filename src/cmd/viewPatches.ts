import { formatTime, showError } from "../pkg/utils";
import type { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initViewPatches(context: GroveContext): () => void {
    return async () => {
        const [patches, patchesErr] =
            await context.evergreen.clients.legacy.getRecentPatches();
        if (patchesErr !== undefined) {
            showError(patchesErr);
            return;
        }
        const options = patches.map((p) => ({
            label: `${p.Description}`,
            description: p.Project,
            detail: `On: ${p.Project} | Status: ${
                p.Status
            } | Created: ${formatTime(
                p.CreateTime,
                "Not started",
            )} | Finished: ${formatTime(p.FinishTime, "Not finished")}`,
            value: p.Id,
        }));
        const patch = await vscode.window.showQuickPick(options, {
            placeHolder: "Which patch would you like to open?",
        });
        if (!patch) {
            return;
        }
        vscode.env.openExternal(
            vscode.Uri.parse(
                `${context.evergreen.config.uiURL}/patch/${patch.value}?redirect_spruce_users=true`,
            ),
        );
    };
}
