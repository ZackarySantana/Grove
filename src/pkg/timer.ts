import { Disposable } from "vscode";

export class Timer extends Disposable {
    private id: NodeJS.Timeout;

    constructor(callback: () => void, time: number) {
        super(() => clearInterval(this.id));
        this.id = setInterval(callback, time);
    }

    clear() {
        clearInterval(this.id);
    }
}
