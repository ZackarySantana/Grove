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
        const name = uri.path
            .substring(uri.path.lastIndexOf("/") + 1)
            .replace(".svg", "");
        const decorators: { [key: string]: FileDecoration } = {
            parent: {
                color: new ThemeColor(""),
            },
            deletions: {
                color: new ThemeColor("charts.red"),
                // badge: "+12 -10",
            },
            additions: {
                color: new ThemeColor("charts.green"),
            },
            success: {
                color: new ThemeColor("charts.green"),
            },
            failed: {
                color: new ThemeColor("charts.red"),
            },
            created: {
                color: new ThemeColor("charts.blue"),
            },
            started: {
                color: new ThemeColor("charts.yellow"),
            },
        };
        for (const color in decorators) {
            if (name === color) {
                return decorators[color];
            }
        }
        return undefined;
    }

    dispose() {
        this._disposables.forEach((d) => d.dispose());
    }
}
