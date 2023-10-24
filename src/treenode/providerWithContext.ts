import { GroveContext } from "src/types";
import * as vscode from "vscode";

export class ProviderWithContext<T> implements vscode.TreeDataProvider<T> {
    protected _onDidChangeTreeData: vscode.EventEmitter<T | undefined | void> =
        new vscode.EventEmitter<T | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<T | undefined | void> =
        this._onDidChangeTreeData.event;

    constructor(protected context: GroveContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: T): vscode.TreeItem {
        throw element;
    }

    getChildren(element?: T): Thenable<T[]> {
        throw element;
    }
}
