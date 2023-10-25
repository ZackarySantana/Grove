import { ExtensionContext, WorkspaceFolder } from "vscode";
import { EvergreenContext } from "./pkg/evergreen/context";
import { OpenPatchesProvider } from "./treenode/patches/open_patches";
import { RecentPatchesProvider } from "./treenode/patches/recent_patches";
import { MainlinePatchesProvider } from "./treenode/patches/mainline_versions";

export type Either<T, R> = [T, undefined] | [undefined, R];

export type Views = {
    recent_patches: RecentPatchesProvider;
    mainline_versions: MainlinePatchesProvider;
    open_patches: OpenPatchesProvider;
};

export type GroveContext = {
    evergreen: EvergreenContext;
    vscode: ExtensionContext;
    workspaceFolder: WorkspaceFolder;
    views: Views;
};
