import { ExtensionContext, WorkspaceFolder } from "vscode";
import { EvergreenContext } from "./pkg/evergreen/context";

export type Either<T, R> = [T, undefined] | [undefined, R];

export type GroveContext = {
    evergreen: EvergreenContext;
    vscode: ExtensionContext;
    workspaceFolder: WorkspaceFolder;
};
