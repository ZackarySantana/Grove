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
import { initRefreshProjectPatches } from "./refreshProjectPatches";
import { initOpenTask } from "./openTask";
import { initOpenLink } from "./openLink";
import { initOpenFile } from "./openFile";
import { initCheckoutCommit } from "./checkoutCommit";
import { initRestartVersion } from "./restartVersion";
import { initRestartPatch } from "./restartPatch";
import { initAbortVersion } from "./abortVersion";
import { initAbortPatch } from "./abortPatch";
import { initConfigurePatch } from "./configurePatch";
import { initRestartTask } from "./restartTask";
import { initAbortTask } from "./abortTask";

export function registerCommands(context: GroveContext) {
    const cmds = {
        viewPatches: initViewPatches,
        openVersion: initOpenVersion,
        openPatch: initOpenPatch,
        openTask: initOpenTask,
        openLink: initOpenLink,
        openFile: initOpenFile,
        checkoutCommit: initCheckoutCommit,
        createPatch: initCreatePatch,
        copyText: initCopyText,
        restartVersion: initRestartVersion,
        restartPatch: initRestartPatch,
        restartTask: initRestartTask,
        abortVersion: initAbortVersion,
        abortPatch: initAbortPatch,
        abortTask: initAbortTask,
        configurePatch: initConfigurePatch,
        refreshRecentPatches: initRefreshRecentPatches,
        refreshProjectPatches: initRefreshProjectPatches,
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
