/* eslint-disable max-lines-per-function */
import { ProviderWithContext } from "../treenode/providerWithContext";
import type { GroveContext } from "src/types";
import * as vscode from "vscode";
import { getConfigurePatchWebview } from "../webview/configurePatch";
import { V2Patch } from "src/pkg/evergreen/types/patch";
import { showError } from "../pkg/utils";
import { Variant } from "src/client/graphqlEvergreen";

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
        let selected: Variant[] = [];
        panel.webview.html = getConfigurePatchWebview(patch, variants);
        console.log(getConfigurePatchWebview(patch, variants));
        panel.webview.onDidReceiveMessage(
            (tests: Variant[]) => {
                selected = tests;
            },
            undefined,
            context.vscode.subscriptions,
        );
        panel.onDidDispose(async () => {
            if (selected.length === 0) {
                vscode.window.showInformationMessage(
                    "Cancelled configuring patch.",
                );
                return;
            }
            vscode.window.showInformationMessage("Finalizing patch...");
            console.log(selected);
            const [, err] = await context.evergreen.clients.v2.configurePatch(
                patch.patch_id,
                patch.description,
                selected.filter((v) => v.tasks.length !== 0),
            );
            if (err) {
                showError(err);
                return;
            }
            if (view) {
                view.refresh();
            }
            vscode.window.showInformationMessage(
                `Finished configuring patch. Refreshing view.`,
            );
        });
    };
}
