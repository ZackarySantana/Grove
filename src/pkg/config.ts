import { Either } from "../types";
import * as vscode from "vscode";

export type GroveConfig = {
    config: string;
    customPatches: { label: string; command: string }[];
};

export function getOptionalConfig<T>(
    section: keyof GroveConfig,
): T | undefined {
    return vscode.workspace.getConfiguration("grove").get<T>(section);
}

export function getConfig<
    P extends keyof GroveConfig,
    R extends GroveConfig[P],
>(section: P): Either<R, Error> {
    const setting = getOptionalConfig<R>(section);

    if (setting === undefined) {
        return [
            undefined,
            new Error("You need the setting: " + section + " set!"),
        ];
    }

    return [setting, undefined];
}
