import moment = require("moment");
import type { Either, GroveContext } from "src/types";
import * as vscode from "vscode";
import { exec } from "child_process";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export function getWorkspaceFolder(): Either<vscode.WorkspaceFolder, Error> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.at(0);
    if (!workspaceFolder) {
        return [undefined, new Error("No workspace is opened")];
    }
    return [workspaceFolder, undefined];
}

export function showError(err: Error | string) {
    if (err instanceof Error) {
        vscode.window.showErrorMessage(err.message);
        console.error(err.message);
        return;
    }
    vscode.window.showErrorMessage(err);
    console.error(err);
}

export function formatTime(finishTime: Date, invalid: string): string {
    finishTime = new Date(finishTime);
    if (finishTime.getFullYear() < 2000) {
        return invalid;
    }
    return moment(finishTime).fromNow();
}

export function applyGitDiffs(context: GroveContext, urls: string[]) {
    let count = 1;
    urls.forEach(async (url) => {
        try {
            const [data, err] =
                await context.evergreen.clients.legacy.getPatchFileDiff(url);
            if (err !== undefined) {
                showError(`Failed to download diff from ${url}: ${err}`);
                return;
            }
            // Create a temporary file in the OS temp directory
            const tempFilePath = join(
                tmpdir(),
                `temp-diff-${Date.now()}${count++}.patch`,
            );
            await fs.writeFile(tempFilePath, data);

            // Apply the diff using the temporary file
            exec(
                `GIT_TRACE=1 git apply --binary --index --whitespace=nowarn < '${tempFilePath}'`,
                {
                    cwd: context.workspaceFolder.uri.path,
                },
                async (error) => {
                    if (error) {
                        console.error(
                            `Failed to apply diff from ${url}:`,
                            error,
                        );
                    } else {
                        console.log(`Successfully applied diff from ${url}`);
                    }

                    // Delete the temporary file after applying the diff
                    await fs.unlink(tempFilePath);
                },
            );
        } catch (error) {
            console.error(
                `Failed to download or apply diff from ${url}:`,
                error,
            );
        }
    });
}

export function getDiffChunk(diff: string, filename: string): string {
    const lines = diff.split("\n");

    const result: string[] = [];
    let inFileChunk = false;

    const fileChunkRe = /^diff --git a\/.* b\/.*$/;
    const fileNameRe = new RegExp(`^diff --git a/${filename} b/${filename}$`);

    for (const line of lines) {
        if (fileChunkRe.test(line)) {
            if (fileNameRe.test(line)) {
                inFileChunk = true;
                result.push(line);
            } else {
                inFileChunk = false;
            }
        } else if (inFileChunk) {
            result.push(line);
        }
    }

    return result.join("\n");
}

export async function downloadDiffFile(
    context: GroveContext,
    url: string,
    file: string,
    callback: (filePath: string) => Promise<void>,
) {
    try {
        const [data, err] =
            await context.evergreen.clients.legacy.getPatchFileDiff(
                url.replace("filediff/", "rawdiff/"),
            );
        if (err !== undefined) {
            showError(`Failed to download diff from ${url}: ${err}`);
            return;
        }
        const tempFilePath = join(tmpdir(), `temp-diff-${Date.now()}.patch`);
        if (url.includes("filediff/")) {
            await fs.writeFile(tempFilePath, getDiffChunk(String(data), file));
        } else {
            await fs.writeFile(tempFilePath, data);
        }

        await callback(tempFilePath);

        // await fs.unlink(tempFilePath);
    } catch (error) {
        showError(`Failed to download diff from ${url}: ${error}`);
    }
}

export async function copyFile(
    source: string,
    callback: (filePath: string) => Promise<void>,
) {
    try {
        const tempFilePath = join(tmpdir(), `temp-file-${Date.now()}`);
        const data = await fs.readFile(source);
        await fs.writeFile(tempFilePath, data);

        await callback(tempFilePath);

        // await fs.unlink(tempFilePath);
    } catch (error) {
        showError(`Failed to copy file from ${source}: ${error}`);
    }
}
