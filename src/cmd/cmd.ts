import { GroveContext } from "../types";
import * as vscode from "vscode";
import { initCreatePatch } from "./createPatch";
import { initViewPatches } from "./viewPatches";

type Commands = {
    [key: string]: (context: GroveContext) => () => void;
};

export function registerCommands(context: GroveContext) {
    const commands = {
        "grove.viewPatches": initViewPatches,
        "grove.createPatch": initCreatePatch,
    } as Commands;

    for (const command in commands) {
        context.vscode.subscriptions.push(
            vscode.commands.registerCommand(
                command,
                commands[command](context),
            ),
        );
    }
}
