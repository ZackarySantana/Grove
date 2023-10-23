import { GroveContext } from "src/types";
import * as vscode from "vscode";

export function initCreatePatch(context: GroveContext): () => void {
    return () => {
        vscode.window.showInformationMessage("Grove create patch here");
        return;
    };
}
