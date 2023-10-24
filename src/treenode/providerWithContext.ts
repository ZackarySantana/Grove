import type { GroveContext } from "src/types";
import * as vscode from "vscode";

export class ProviderWithContext<T>
    implements vscode.TreeDataProvider<T>, vscode.Disposable
{
    protected _onDidChangeTreeData: vscode.EventEmitter<T | undefined | void> =
        new vscode.EventEmitter<T | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<T | undefined | void> =
        this._onDidChangeTreeData.event;
    protected _disposables: vscode.Disposable[];

    constructor(protected context: GroveContext) {
        this._disposables = [];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: T): vscode.TreeItem {
        throw element;
    }

    getChildren(element?: T): Thenable<T[]> {
        throw element;
    }

    dispose() {
        this._disposables.forEach((dispose) => dispose.dispose());
    }
}
