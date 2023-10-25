import * as vscode from "vscode";
import { ProviderWithContext } from "../providerWithContext";
import type { V2Patch } from "src/pkg/evergreen/types/patch";
import { formatTime } from "../../pkg/utils";
import { TreeFileDecorationProvider } from "../fileDecorator";
import type { Either, GroveContext } from "src/types";
import { getRequesterName } from "../../pkg/evergreen/requester";

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
        state?: vscode.TreeItemCollapsibleState,
    ) {
        super(
            context,
            desc,
            state
                ? state
                : children && children.length > 0
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
        public readonly patch: V2Patch,
    ) {
        super(
            context,
            patch?.description,
            vscode.TreeItemCollapsibleState.Expanded,
            true,
        );
    }

    createProjectChild(): PatchChild {
        return new PatchChild(
            this.context,
            `Project: ${this.patch.project_identifier}`,
        );
    }

    createStatusChild(): PatchChild {
        return new PatchChild(this.context, `Status: ${this.patch.status}`);
    }

    createCreatedChild(): PatchChild {
        return new PatchChild(
            this.context,
            `Created: ${formatTime(
                new Date(this.patch.create_time),
                "Not started",
            )}`,
        );
    }

    createFinishedChild(): PatchChild {
        if (this.patch.finish_time === null) {
            return new PatchChild(this.context, `Finished: Not finished`);
        }
        return new PatchChild(
            this.context,
            `Finished: ${formatTime(
                new Date(this.patch.finish_time),
                "Not finished",
            )}`,
        );
    }

    createActionStartChild(): PatchChild {
        const start = new PatchChild(this.context, `Start`);
        start.command = {
            title: "Start this patch",
            command: "grove.startPatch",
            arguments: [this.patch.patch_id],
        };
        start.iconPath = new vscode.ThemeIcon("play");
        return start;
    }

    createActionAbortChild(): PatchChild {
        const abort = new PatchChild(this.context, `Abort`);
        abort.command = {
            title: "Abort this patch",
            command: "grove.stopPatch",
            arguments: [this.patch.patch_id],
        };
        abort.iconPath = new vscode.ThemeIcon("stop");
        return abort;
    }

    createActionRestartChild(): PatchChild {
        const abort = new PatchChild(this.context, `Restart`);
        abort.command = {
            title: "Restart this patch",
            command: "grove.restartPatch",
            arguments: [this.patch.patch_id],
        };
        abort.iconPath = new vscode.ThemeIcon("debug-restart");
        return abort;
    }

    createActionOpenChild(): PatchChild {
        const open = new PatchChild(this.context, `View on UI`);
        open.command = {
            title: "View on UI",
            command: "grove.openPatch",
            arguments: [this.patch.patch_id],
        };
        open.iconPath = new vscode.ThemeIcon("link");
        return open;
    }

    createActionsChild(): PatchChild {
        const actions: PatchChild[] = [];
        if (!this.patch.activated) {
            actions.push(this.createActionStartChild());
        } else {
            actions.push(this.createActionRestartChild());
            if (this.patch.finish_time === null) {
                actions.push(this.createActionAbortChild());
            }
        }
        actions.push(this.createActionOpenChild());
        const child = new PatchChild(
            this.context,
            `Actions`,
            actions,
            vscode.TreeItemCollapsibleState.Collapsed,
        );
        return child;
    }

    createDetailsChild(): PatchChild {
        const createDetail = (label: string, textToCopy: string) => {
            const detail = new PatchChild(
                this.context,
                label.replace("%s", textToCopy),
            );
            detail.command = {
                command: "grove.copyText",
                title: "Copy Text",
                arguments: [textToCopy],
            };
            return detail;
        };
        return new PatchChild(
            this.context,
            `Details`,
            [
                createDetail(`Id: %s`, this.patch.patch_id),
                createDetail(
                    `Requester: ${getRequesterName(this.patch.requester)}`,
                    this.patch.requester,
                ),
                createDetail(
                    `Commit: ${this.patch.git_hash}`,
                    this.patch.git_hash,
                ),
            ],
            vscode.TreeItemCollapsibleState.Collapsed,
        );
    }

    createChangesChild(): PatchChild {
        return new PatchChild(
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
        );
    }

    getChildren(): Patch[] {
        if (!this.patch) {
            return [];
        }
        return [
            this.createProjectChild(),
            this.createStatusChild(),
            this.createCreatedChild(),
            this.createFinishedChild(),
            this.createActionsChild(),
            this.createDetailsChild(),
            this.createChangesChild(),
        ];
    }
}

export class PatchesProvider extends ProviderWithContext<Patch> {
    readonly fileDecoratorProvider: TreeFileDecorationProvider;

    protected retrievePatches: () => Thenable<Either<V2Patch[], Error>>;
    protected filter: (patch: V2Patch) => boolean;

    constructor(protected context: GroveContext) {
        super(context);
        this._disposables.push(
            (this.fileDecoratorProvider = new TreeFileDecorationProvider()),
        );
        this.retrievePatches = () =>
            context.evergreen.clients.v2.getUserPatches(
                context.evergreen.config.user,
            );
        this.filter = () => true;
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
            return this.retrievePatches().then(([patches, err]) => {
                if (err !== undefined) {
                    throw err;
                }
                return patches
                    .filter(this.filter)
                    .map((p) => new PatchParent(this.context, p));
            });
        }
        return Promise.resolve(patch.getChildren());
    }
}
