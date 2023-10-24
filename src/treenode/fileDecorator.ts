import {
    window,
    Uri,
    Disposable,
    Event,
    EventEmitter,
    FileDecoration,
    FileDecorationProvider,
    ThemeColor,
} from "vscode";

export class TreeFileDecorationProvider
    implements FileDecorationProvider, Disposable
{
    protected _disposables: Disposable[];

    private readonly _onDidChangeFileDecorations: EventEmitter<Uri | Uri[]> =
        new EventEmitter<Uri | Uri[]>();
    readonly onDidChangeFileDecorations: Event<Uri | Uri[]> =
        this._onDidChangeFileDecorations.event;

    constructor() {
        this._disposables = [];
        this._disposables.push(window.registerFileDecorationProvider(this));
    }

    updateActiveEditor(uri: Uri): void {
        this._onDidChangeFileDecorations.fire(uri);
    }

    provideFileDecoration(uri: Uri): FileDecoration | undefined {
        console.debug("=====");
        console.debug(uri);
        if (uri.path === "/testing/this") {
            return {
                badge: "⇐",
                color: new ThemeColor("charts.red"),
                // color: new vscode.ThemeColor("tab.activeBackground"),
            };
        }
        return undefined;
    }

    dispose() {
        this._disposables.forEach((d) => d.dispose());
    }
}
