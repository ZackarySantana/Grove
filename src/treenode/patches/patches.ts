/* eslint-disable max-lines */
import * as vscode from "vscode";
import { ProviderWithContext } from "../providerWithContext";
import type { V2PatchWithVersionAndTasks } from "src/pkg/evergreen/types/patch";
import { formatTime } from "../../pkg/utils";
import { TreeFileDecorationProvider } from "../fileDecorator";
import type { Either, GroveContext } from "src/types";
import { getRequesterName } from "../../pkg/evergreen/requester";
import { createCopyTextPatchChild, createOpenLinkPatchChild } from "./helpers";
import { Task } from "src/pkg/evergreen/types/task";

export type PatchTreeItemContext = GroveContext & {
    view: ProviderWithContext<unknown>;
};

export class Patch extends vscode.TreeItem {
    constructor(
        protected readonly context: PatchTreeItemContext,
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
        context: PatchTreeItemContext,
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
        context: PatchTreeItemContext,
        public readonly patch: V2PatchWithVersionAndTasks,
        private additionalDetails: () => PatchChild[],
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

    createStartedChild(): PatchChild {
        if (this.patch.start_time === null) {
            return new PatchChild(this.context, `Started: Not started`);
        }
        return new PatchChild(
            this.context,
            `Started: ${formatTime(
                new Date(this.patch.start_time),
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

    createActionsCheckoutChild(): PatchChild {
        const start = new PatchChild(this.context, `Checkout Commit`);
        start.command = {
            title: "Checkout commit",
            command: "grove.checkoutCommit",
            arguments: [this.patch.git_hash],
        };
        start.iconPath = new vscode.ThemeIcon("git-branch");
        return start;
    }

    createActionStartChild(): PatchChild {
        const start = new PatchChild(this.context, `Start`);
        start.command = {
            title: "Start this patch",
            command: "grove.startPatch",
            arguments: [this.patch.patch_id, this.context.view],
        };
        start.iconPath = new vscode.ThemeIcon("play");
        return start;
    }

    createActionAbortChild(): PatchChild {
        const abort = new PatchChild(this.context, `Abort`);
        abort.command = {
            title: "Abort this patch",
            command: "grove.abortPatch",
            arguments: [this.patch.patch_id, this.context.view],
        };
        abort.iconPath = new vscode.ThemeIcon("stop");
        return abort;
    }

    createActionRestartChild(): PatchChild {
        const restart = new PatchChild(this.context, `Restart`);
        restart.command = {
            title: "Restart this patch",
            command: "grove.restartPatch",
            arguments: [this.patch.patch_id, this.context.view],
        };
        restart.iconPath = new vscode.ThemeIcon("debug-restart");
        return restart;
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

    createActionConfigureChild(): PatchChild {
        const open = new PatchChild(this.context, `Configure`);
        open.command = {
            title: "Configure",
            command: "grove.configurePatch",
            arguments: [this.patch.patch_id, this.context.view],
        };
        open.iconPath = new vscode.ThemeIcon("settings-gear");
        return open;
    }

    createActionsChild(): PatchChild {
        const actions: PatchChild[] = [];
        if (!this.patch.activated) {
            actions.push(this.createActionStartChild());
        } else {
            actions.push(this.createActionOpenChild());
            actions.push(this.createActionRestartChild());
        }
        actions.push(this.createActionAbortChild());
        actions.push(this.createActionConfigureChild());
        actions.push(this.createActionsCheckoutChild());
        const child = new PatchChild(
            this.context,
            `Actions`,
            actions,
            vscode.TreeItemCollapsibleState.Collapsed,
        );
        return child;
    }

    createTaskActionOpenChild(task: Task): PatchChild {
        const open = new PatchChild(this.context, `View on UI`);
        open.command = {
            title: "View on UI",
            command: "grove.openTask",
            arguments: [task.task_id],
        };
        open.iconPath = new vscode.ThemeIcon("link");
        return open;
    }

    createTaskActionsChild(task: Task): PatchChild {
        const actions: PatchChild[] = [];
        actions.push(this.createTaskActionOpenChild(task));
        const child = new PatchChild(
            this.context,
            `Actions`,
            actions,
            vscode.TreeItemCollapsibleState.Collapsed,
        );
        return child;
    }

    createTaskLogsChild(task: Task): PatchChild {
        const logs: PatchChild[] = [];
        logs.push(
            createOpenLinkPatchChild(
                this.context,
                "Open All",
                task.parsley_logs.all_log,
            ),
        );
        logs.push(
            createOpenLinkPatchChild(
                this.context,
                "Open Task",
                task.parsley_logs.task_log,
            ),
        );
        logs.push(
            createOpenLinkPatchChild(
                this.context,
                "Open Agent",
                task.parsley_logs.agent_log,
            ),
        );
        logs.push(
            createOpenLinkPatchChild(
                this.context,
                "Open System",
                task.parsley_logs.system_log,
            ),
        );
        logs.forEach(
            (c) =>
                (c.iconPath = new vscode.ThemeIcon("ports-open-browser-icon")),
        );
        const child = new PatchChild(
            this.context,
            `Logs`,
            logs,
            vscode.TreeItemCollapsibleState.Collapsed,
        );
        return child;
    }

    createTaskChild(task: Task): PatchChild {
        const taskChild = new PatchChild(
            this.context,
            `${task.display_name}`,
            [
                new PatchChild(this.context, `Status: ${task.status}`),
                this.createTaskActionsChild(task),
                this.createTaskLogsChild(task),
                new PatchChild(this.context, `Task Details`, [
                    createCopyTextPatchChild(
                        this.context,
                        `Task Id: %s`,
                        task.task_id,
                    ),
                    createCopyTextPatchChild(
                        this.context,
                        `Execution: %s`,
                        String(task.execution),
                    ),
                ]),
            ],
            vscode.TreeItemCollapsibleState.Collapsed,
        );

        taskChild.setResourceStatusUri(`Status: ${task.status}`);

        return taskChild;
    }

    createTasksChild(): PatchChild {
        return new PatchChild(
            this.context,
            `Tasks`,
            [
                ...(this.patch.versionAndTasks?.tasks.map((t) =>
                    this.createTaskChild(t),
                ) ?? []),
            ],
            vscode.TreeItemCollapsibleState.Collapsed,
        );
    }

    createDetailsChild(): PatchChild {
        return new PatchChild(
            this.context,
            `Patch Details`,
            [
                createCopyTextPatchChild(
                    this.context,
                    `Patch Id: %s`,
                    this.patch.patch_id,
                ),
                createCopyTextPatchChild(
                    this.context,
                    `Requester: ${getRequesterName(this.patch.requester)}`,
                    this.patch.requester,
                ),
                createCopyTextPatchChild(
                    this.context,
                    `Commit: %s`,
                    this.patch.git_hash,
                ),
                ...this.additionalDetails(),
            ],
            vscode.TreeItemCollapsibleState.Collapsed,
        );
    }

    createOpenFileChild(label: string, fileName: string): PatchChild {
        const child = new PatchChild(this.context, label);
        child.command = {
            title: "Open file",
            command: "grove.openFile",
            arguments: [fileName],
        };
        child.iconPath = new vscode.ThemeIcon("open-editors-view-icon");
        return child;
    }

    createChangesChild(): PatchChild {
        return new PatchChild(
            this.context,
            `Changes`,
            this.patch.module_code_changes.flatMap((p) =>
                p.file_diffs.flatMap(
                    (s) =>
                        new PatchChild(this.context, s.file_name, [
                            this.createOpenFileChild("Open File", s.file_name),
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
            this.createStartedChild(),
            this.createFinishedChild(),
            this.createActionsChild(),
            this.createTasksChild(),
            this.createDetailsChild(),
            this.createChangesChild(),
        ];
    }
}

export class PatchesProvider extends ProviderWithContext<Patch> {
    readonly fileDecoratorProvider: TreeFileDecorationProvider;

    protected retrievePatches: () => Thenable<
        Either<V2PatchWithVersionAndTasks[], Error>
    >;
    protected filter: (patch: V2PatchWithVersionAndTasks) => boolean;
    protected additionalDetails: (
        patch: V2PatchWithVersionAndTasks,
    ) => PatchChild[];
    protected contextWithView: PatchTreeItemContext;

    constructor(protected context: GroveContext) {
        super(context);
        this._disposables.push(
            (this.fileDecoratorProvider = new TreeFileDecorationProvider()),
        );
        this.retrievePatches = () =>
            context.evergreen.clients.v2.getUserPatchesWithBuildsAndTasks(
                context.evergreen.config.user,
            );
        this.filter = () => true;
        this.additionalDetails = () => [];
        this.contextWithView = { ...this.context, view: this };
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
                    .map(
                        (p) =>
                            new PatchParent(this.contextWithView, p, () =>
                                this.additionalDetails(p),
                            ),
                    );
            });
        }
        return Promise.resolve(patch.getChildren());
    }
}
