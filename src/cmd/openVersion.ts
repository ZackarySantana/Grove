import { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initOpenVersion(context: GroveContext) {
    return async (version: string) => {
        vscode.env.openExternal(
            vscode.Uri.parse(
                `${context.evergreen.config.uiURL}/version/${version}?redirect_spruce_users=true`,
            ),
        );
    };
}
