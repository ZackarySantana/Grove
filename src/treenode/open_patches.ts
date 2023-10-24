import * as vscode from "vscode";
import { ProviderWithContext } from "./providerWithContext";
import type { Patch as EvergreenPatch } from "src/pkg/evergreen/types/patch";
import { formatTime } from "../pkg/utils";
import { TreeFileDecorationProvider } from "./fileDecorator";
import type { GroveContext } from "src/types";

export class Patch extends vscode.TreeItem {
    constructor(
        public readonly desc: string,
        public readonly state: vscode.TreeItemCollapsibleState,
    ) {
        super(desc, state);
        this.resourceUri = vscode.Uri.parse("testing/this");
    }

    getChildren(): Patch[] {
        return [];
    }
}

export class PatchChild extends Patch {
    constructor(
        public readonly desc: string,
        public readonly children?: Patch[],
    ) {
        super(
            desc,
            children && children.length > 0
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None,
        );
    }

    getChildren(): Patch[] {
        if (!this.children) {
            return [];
        }
        return this.children;
    }
}

export class PatchParent extends Patch {
    constructor(public readonly patch: EvergreenPatch) {
        super(patch?.Description, vscode.TreeItemCollapsibleState.Expanded);
    }

    getChildren(): Patch[] {
        if (!this.patch) {
            return [];
        }
        return [
            new PatchChild(`Project: ${this.patch.Project}`),
            new PatchChild(`Status: ${this.patch.Status}`),
            new PatchChild(
                `Created: ${formatTime(this.patch.CreateTime, "Not started")}`,
            ),
            new PatchChild(
                `Finished: ${formatTime(
                    this.patch.FinishTime,
                    "Not finished",
                )}`,
            ),
            new PatchChild(
                `Changes`,
                this.patch.Patches.flatMap((p) =>
                    p.PatchSet.Summary.flatMap(
                        (s) =>
                            new PatchChild(s.Name, [
                                new PatchChild(`Additions: ${s.Additions}`),
                                new PatchChild(`Deletions: ${s.Deletions}`),
                            ]),
                    ),
                ),
            ),
        ];
    }
}

export class OpenPatchesProvider extends ProviderWithContext<Patch> {
    readonly fileDecoratorProvider: TreeFileDecorationProvider;

    constructor(protected context: GroveContext) {
        super(context);
        this._disposables.push(
            (this.fileDecoratorProvider = new TreeFileDecorationProvider()),
        );
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(patch: Patch): vscode.TreeItem {
        return patch;
    }

    getChildren(patch?: Patch): Thenable<Patch[]> {
        console.debug(patch);
        if (patch?.resourceUri) {
            this.fileDecoratorProvider.updateActiveEditor(patch?.resourceUri);
        }
        if (!patch) {
            return this.context.evergreen.clients.legacy
                .getRecentPatches()
                .then(([patches, err]) => {
                    if (err !== undefined) {
                        throw err;
                    }
                    return patches.map((p) => new PatchParent(p));
                });
        }
        return Promise.resolve(patch.getChildren());
    }
}
