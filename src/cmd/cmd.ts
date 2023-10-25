import { GroveContext } from "../types";
import * as vscode from "vscode";
import { initCreatePatch } from "./createPatch";
import { initViewPatches } from "./viewPatches";
import { initRefreshOpenPatches } from "./refreshOpenPatches";
import { initCopyText } from "./copyText";
import { initRefreshRecentPatches } from "./refreshRecentPatches";
import { initRefreshMainlineVersions } from "./refreshMainlinePatches";
import { initOpenVersion } from "./openVersion";
import { initOpenPatch } from "./openPatch";

export function registerCommands(context: GroveContext) {
    const cmds = {
        viewPatches: initViewPatches,
        openVersion: initOpenVersion,
        openPatch: initOpenPatch,
        createPatch: initCreatePatch,
        copyText: initCopyText,
        refreshRecentPatches: initRefreshRecentPatches,
        refreshMainlineVersions: initRefreshMainlineVersions,
        refreshOpenPatches: initRefreshOpenPatches,
    };
    const cmdNames = Object.keys(cmds) as (keyof typeof cmds)[];

    cmdNames.forEach((cmd) => {
        context.vscode.subscriptions.push(
            vscode.commands.registerCommand(`grove.${cmd}`, cmds[cmd](context)),
        );
    });
}
