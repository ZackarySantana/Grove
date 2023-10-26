import { ProviderWithContext } from "src/treenode/providerWithContext";
import { showError } from "../pkg/utils";
import type { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initConfigurePatch(context: GroveContext) {
    return async (id: string, view?: ProviderWithContext<unknown>) => {
        vscode.window.showInformationMessage(`Configuring patch ${id}`);
        // TODO: confiugure patch somehow
        showError("Sorry, configuring is not done yet!");
        if (view) {
            view.refresh();
        }
        vscode.window.showInformationMessage(
            `Finished aborting patch. Refreshing view.`,
        );
    };
}
