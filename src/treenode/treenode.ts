import { GroveContext } from "../types";
import * as vscode from "vscode";
import { OpenPatchesProvider } from "./open_patches";
import { ProviderWithContext } from "./providerWithContext";

type treenodes = {
    [key: string]: ProviderWithContext<unknown>;
};

export function registerTreeNodes(context: GroveContext) {
    const treenodes = {
        "grove.open_patches": new OpenPatchesProvider(context),
    } as treenodes;

    for (const treenode in treenodes) {
        vscode.window.registerTreeDataProvider(treenode, treenodes[treenode]);
    }
}
