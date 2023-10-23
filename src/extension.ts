import * as vscode from "vscode";
import { registerCommands } from "./cmd/cmd";
import { GroveContext } from "./types";
import { getEvergreenConfig } from "./pkg/evergreen/config";
import { createEvergreenContext } from "./pkg/evergreen/context";
import { getWorkspaceFolder, showError } from "./pkg/utils";

export async function activate(context: vscode.ExtensionContext) {
    const [evergreenConfig, configErr] = await getEvergreenConfig();
    if (configErr !== undefined) {
        showError(`Could not find Evergreen config ${configErr}`);
        return;
    }

    const [workspaceFolder, workspaceFolderErr] = getWorkspaceFolder();
    if (workspaceFolderErr !== undefined) {
        showError(`Could not create Evergreen context ${workspaceFolderErr}`);
        return;
    }

    const [evergreenContext, contextErr] = createEvergreenContext(
        evergreenConfig,
        workspaceFolder,
    );
    if (contextErr !== undefined) {
        showError(`Could not create Evergreen context ${contextErr}`);
        return;
    }

    const groveContext = {
        vscode: context,
        evergreen: evergreenContext,
        workspaceFolder: workspaceFolder,
    } satisfies GroveContext;

    registerCommands(groveContext);
}

// This method is called when your extension is deactivated
export function deactivate() {}
