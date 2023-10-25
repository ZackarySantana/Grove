import { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initOpenPatch(context: GroveContext) {
    return async (patch: string) => {
        vscode.env.openExternal(
            vscode.Uri.parse(
                `${context.evergreen.config.uiURL}/patch/${patch}?redirect_spruce_users=true`,
            ),
        );
    };
}
