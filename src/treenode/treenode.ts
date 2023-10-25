/* eslint-disable camelcase */
import { GroveContext } from "../types";
import * as vscode from "vscode";
import { OpenPatchesProvider } from "./patches/open_patches";
import { RecentPatchesProvider } from "./patches/recent_patches";
import { MainlinePatchesProvider } from "./patches/mainline_versions";
import { Patch } from "./patches/patches";
import { Version } from "./patches/versions";

export function registerTreeNodes(context: GroveContext) {
    context.views = {
        recent_patches: new RecentPatchesProvider(context),
        mainline_versions: new MainlinePatchesProvider(context),
        open_patches: new OpenPatchesProvider(context),
    };
    const treenames = Object.keys(
        context.views,
    ) as (keyof typeof context.views)[];

    treenames.forEach((treenode) => {
        vscode.window.registerTreeDataProvider<Patch | Version>(
            `grove.${treenode}`,
            context.views[treenode],
        );
    });
}
