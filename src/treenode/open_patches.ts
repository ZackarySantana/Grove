import * as vscode from "vscode";
import { ProviderWithContext } from "./providerWithContext";
import type { V2UserPatch } from "src/pkg/evergreen/types/patch";
import { formatTime } from "../pkg/utils";
import { TreeFileDecorationProvider } from "./fileDecorator";
import type { GroveContext } from "src/types";

export class Patch extends vscode.TreeItem {
    constructor(
        protected readonly context: GroveContext,
        public readonly desc: string,
        public readonly state: vscode.TreeItemCollapsibleState,
        isParent: boolean,
    ) {
        super(desc, state);
        this.setResourceUri(desc, isParent);
    }

    setResourceUri(label: string, isParent: boolean) {
        if (isParent) {
            this.setResourceParentUri();
            return;
        }
        this.setResourceDeletionUri(label);
        this.setResourceAdditionUri(label);
        this.setResourceStatusUri(label);
        this.setResourceTimeUri(label);
    }

    setRU(path: string) {
        this.resourceUri = vscode.Uri.joinPath(
            this.context.vscode.extensionUri,
            `media/resources/${path}.svg`,
        );
        this.iconPath = this.resourceUri;
    }

    setResourceParentUri() {
        this.setRU("parent");
    }

    setResourceDeletionUri(label: string) {
        if (label.includes("Deletions:")) {
            this.setRU("deletions");
            this.iconPath = new vscode.ThemeIcon(
                "dash",
                new vscode.ThemeColor("charts.red"),
            );
            this.label = this.desc.replace("Deletions: ", "");
        }
    }

    setResourceAdditionUri(label: string) {
        if (label.startsWith("Additions:")) {
            this.setRU("additions");
            this.iconPath = new vscode.ThemeIcon(
                "terminal-new",
                new vscode.ThemeColor("charts.green"),
            );
            this.label = this.desc.replace("Additions: ", "");
        }
    }

    setResourceStatusUri(label: string) {
        if (label.startsWith("Status:")) {
            let color;
            if (label.includes("success")) {
                this.setRU("success");
                color = new vscode.ThemeColor("charts.green");
            }
            if (label.includes("failed")) {
                this.setRU("failed");
                color = new vscode.ThemeColor("charts.red");
            }
            if (label.includes("created")) {
                this.setRU("created");
                color = new vscode.ThemeColor("charts.blue");
            }
            if (label.includes("started")) {
                this.setRU("started");
                color = new vscode.ThemeColor("charts.yellow");
            }
            this.iconPath = new vscode.ThemeIcon("circle-filled", color);
        }
    }

    setResourceTimeUri(label: string) {
        if (label.startsWith("Created:")) {
            // this.iconPath = new vscode.ThemeIcon("play-circle");
        }

        if (label.startsWith("Finished:")) {
            // this.iconPath = new vscode.ThemeIcon("stop-circle");
        }
    }

    getChildren(): Patch[] {
        return [];
    }
}

export class PatchChild extends Patch {
    constructor(
        context: GroveContext,
        public readonly desc: string,
        public readonly children?: Patch[],
    ) {
        super(
            context,
            desc,
            children && children.length > 0
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None,
            false,
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
    constructor(
        context: GroveContext,
        public readonly patch: V2UserPatch,
    ) {
        super(
            context,
            patch?.description,
            vscode.TreeItemCollapsibleState.Expanded,
            true,
        );
    }

    getChildren(): Patch[] {
        if (!this.patch) {
            return [];
        }
        return [
            new PatchChild(
                this.context,
                `Project: ${this.patch.project_identifier}`,
            ),
            new PatchChild(this.context, `Status: ${this.patch.status}`),
            new PatchChild(
                this.context,
                `Created: ${formatTime(
                    new Date(this.patch.create_time),
                    "Not started",
                )}`,
            ),
            new PatchChild(
                this.context,
                `Finished: ${formatTime(
                    new Date(this.patch.finish_time),
                    "Not finished",
                )}`,
            ),
            new PatchChild(
                this.context,
                `Changes`,
                this.patch.module_code_changes.flatMap((p) =>
                    p.file_diffs.flatMap(
                        (s) =>
                            new PatchChild(this.context, s.file_name, [
                                new PatchChild(
                                    this.context,
                                    `Additions: ${s.additions}`,
                                ),
                                new PatchChild(
                                    this.context,
                                    `Deletions: ${s.deletions}`,
                                ),
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
        if (patch?.resourceUri) {
            this.fileDecoratorProvider.updateActiveEditor(patch?.resourceUri);
        }
        if (!patch) {
            return this.context.evergreen.clients.v2
                .getUserPatches(this.context.evergreen.config.user)
                .then(([patches, err]) => {
                    if (err !== undefined) {
                        throw err;
                    }
                    return patches.map((p) => new PatchParent(this.context, p));
                });
        }
        return Promise.resolve(patch.getChildren());
    }
}
