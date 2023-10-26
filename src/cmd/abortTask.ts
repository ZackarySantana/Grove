import { ProviderWithContext } from "src/treenode/providerWithContext";
import { showError } from "../pkg/utils";
import type { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initAbortTask(context: GroveContext) {
    return async (id: string, view?: ProviderWithContext<unknown>) => {
        vscode.window.showInformationMessage(`Aborting task ${id}`);
        const [, err] = await context.evergreen.clients.v2.abortTask(id);
        if (err !== undefined) {
            showError(err);
            return;
        }
        if (view) {
            view.refresh();
        }
        vscode.window.showInformationMessage(
            `Finished aborting task. Refreshing view.`,
        );
    };
}
