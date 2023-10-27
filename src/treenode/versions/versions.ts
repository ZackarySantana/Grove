import * as vscode from "vscode";
import { ProviderWithContext } from "../providerWithContext";
import type { V2Version } from "src/pkg/evergreen/types/version";
import { formatTime } from "../../pkg/utils";
import { TreeFileDecorationProvider } from "../fileDecorator";
import type { Either, GroveContext } from "src/types";
import { getRequesterName } from "../../pkg/evergreen/requester";

export class Version extends vscode.TreeItem {
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

    getChildren(): Version[] {
        return [];
    }
}

export class VersionChild extends Version {
    constructor(
        context: GroveContext,
        public readonly desc: string,
        public readonly children?: Version[],
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

    getChildren(): Version[] {
        if (!this.children) {
            return [];
        }
        return this.children;
    }
}

export class VersionParent extends Version {
    constructor(
        context: GroveContext,
        public readonly version: V2Version,
    ) {
        super(
            context,
            version?.message,
            vscode.TreeItemCollapsibleState.Expanded,
            true,
        );
    }

    createProjectChild(): VersionChild {
        return new VersionChild(
            this.context,
            `Project: ${this.version.project_identifier}`,
        );
    }

    createStatusChild(): VersionChild {
        return new VersionChild(this.context, `Status: ${this.version.status}`);
    }

    createCreatedChild(): VersionChild {
        return new VersionChild(
            this.context,
            `Created: ${formatTime(
                new Date(this.version.create_time),
                "Not started",
            )}`,
        );
    }

    createFinishedChild(): VersionChild {
        if (this.version.finish_time === null) {
            return new VersionChild(this.context, `Finished: Not finished`);
        }
        return new VersionChild(
            this.context,
            `Finished: ${formatTime(
                new Date(this.version.finish_time),
                "Not finished",
            )}`,
        );
    }

    createActionRestartChild(): VersionChild {
        const abort = new VersionChild(this.context, `Restart`);
        abort.command = {
            title: "Restart this Version",
            command: "grove.restartVersion",
            arguments: [this.version.version_id],
        };
        abort.iconPath = new vscode.ThemeIcon("debug-restart");
        return abort;
    }

    createActionOpenChild(): VersionChild {
        const open = new VersionChild(this.context, `View on UI`);
        open.command = {
            title: "View on UI",
            command: "grove.openVersion",
            arguments: [this.version.version_id],
        };
        open.iconPath = new vscode.ThemeIcon("link");
        return open;
    }

    createActionsChild(): VersionChild {
        const actions: VersionChild[] = [];
        if (this.version.activated) {
            actions.push(this.createActionRestartChild());
        }
        actions.push(this.createActionOpenChild());
        const child = new VersionChild(
            this.context,
            `Actions`,
            actions,
            vscode.TreeItemCollapsibleState.Collapsed,
        );
        return child;
    }

    createDetailsChild(): VersionChild {
        const createDetail = (label: string, textToCopy: string) => {
            const detail = new VersionChild(
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
        return new VersionChild(
            this.context,
            `Details`,
            [
                createDetail(`Id: %s`, this.version.version_id),
                createDetail(
                    `Requester: ${getRequesterName(this.version.requester)}`,
                    this.version.requester,
                ),
                createDetail(
                    `Commit: ${this.version.revision}`,
                    this.version.revision,
                ),
            ],
            vscode.TreeItemCollapsibleState.Collapsed,
        );
    }

    getChildren(): Version[] {
        if (!this.version) {
            return [];
        }
        return [
            this.createProjectChild(),
            this.createStatusChild(),
            this.createCreatedChild(),
            this.createFinishedChild(),
            this.createActionsChild(),
            this.createDetailsChild(),
        ];
    }
}

export class VersionsProvider extends ProviderWithContext<Version> {
    readonly fileDecoratorProvider: TreeFileDecorationProvider;

    protected retrieveVersions: () => Thenable<Either<V2Version[], Error>>;
    protected filter: (version: V2Version) => boolean;

    constructor(protected context: GroveContext) {
        super(context);
        this._disposables.push(
            (this.fileDecoratorProvider = new TreeFileDecorationProvider()),
        );
        this.retrieveVersions = () =>
            context.evergreen.clients.v2.getProjectVersions(
                context.evergreen.currentProject.id,
            );
        this.filter = () => true;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(version: Version): vscode.TreeItem {
        return version;
    }

    getChildren(version?: Version): Thenable<Version[]> {
        if (version?.resourceUri) {
            this.fileDecoratorProvider.updateActiveEditor(version?.resourceUri);
        }
        if (!version) {
            return this.retrieveVersions().then(([versions, err]) => {
                if (err !== undefined) {
                    throw err;
                }
                return versions
                    .filter(this.filter)
                    .map((p) => new VersionParent(this.context, p));
            });
        }
        return Promise.resolve(version.getChildren());
    }
}
