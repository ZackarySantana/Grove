import { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initOpenTask(context: GroveContext) {
    return async (task: string) => {
        vscode.env.openExternal(
            vscode.Uri.parse(
                `${context.evergreen.config.uiURL}/task/${task}?redirect_spruce_users=true`,
            ),
        );
    };
}
