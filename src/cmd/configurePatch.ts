import { ProviderWithContext } from "../treenode/providerWithContext";
import type { GroveContext } from "src/types";
import * as vscode from "vscode";
import { getConfigurePatchWebview } from "../webview/configurePatch";
import { V2Patch } from "src/pkg/evergreen/types/patch";
import { showError } from "../pkg/utils";

export function initConfigurePatch(context: GroveContext) {
    return async (patch: V2Patch, view?: ProviderWithContext<unknown>) => {
        vscode.window.showInformationMessage(
            `Configuring patch ${patch.patch_id}`,
        );
        const panel = vscode.window.createWebviewPanel(
            "configurePatch",
            `Configuring Patch ${patch.description}`,
            vscode.ViewColumn.One,
            { enableScripts: true },
        );
        const [variants, err] =
            await context.evergreen.clients.graphql.getPatchPotentialBuildsAndTasks(
                patch.patch_id,
            );
        if (err) {
            showError(err);
            return;
        }
        panel.webview.html = getConfigurePatchWebview(patch, variants);
        panel.webview.onDidReceiveMessage(
            (tests: string) => {
                console.log(tests);
                if (view) {
                    view.refresh();
                }
                vscode.window.showInformationMessage(
                    `Finished configuring patch. Refreshing view.`,
                );
            },
            undefined,
            context.vscode.subscriptions,
        );
    };
}
