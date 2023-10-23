import * as vscode from "vscode";
import { load } from "js-yaml";
import { getConfig } from "../config";
import { LOCAL_CONFIG, PROD_CONFIG, STAGING_CONFIG } from "../constants";
import { homedir } from "os";
import { Either } from "../../types";

export type API = {
    url: string;
    key: string;
};

export type Project = {
    path: string;
    name: string;
};

export type EvergreenConfig = {
    api: API;
    projects: Project[];
    user: string;
    uiURL: string;
};

export function getEvergreenConfigURI(): Either<string, Error> {
    const [config, err] = getConfig("config");

    if (err !== undefined) {
        return [undefined, err];
    }

    let uri = config;
    if (config === "prod") {
        uri = PROD_CONFIG;
    }
    if (config === "staging") {
        uri = STAGING_CONFIG;
    }
    if (config === "local") {
        uri = LOCAL_CONFIG;
    }

    return [uri.replace("~", homedir), undefined];
}

export const selfTestsSelector = {
    pattern: "**/.github/workflows/*.{yaml,yml}",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function requireOnObject<T = string>(obj: any, value: string): T {
    if (value in obj) {
        return obj[value];
    }
    throw new Error(`We could not find '${value} in your config.`);
}

export function getEvergreenConfig(): Thenable<Either<EvergreenConfig, Error>> {
    const [configURI, err] = getEvergreenConfigURI();

    if (err !== undefined) {
        return new Promise((resolve) => {
            resolve([undefined, err]);
        });
    }

    return vscode.workspace.openTextDocument(configURI).then(
        (document) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const doc = load(document.getText()) as any;

            const projectsForDirectory = requireOnObject<
                Record<string, string>
            >(doc, "projects_for_directory");

            const projects = [] as Project[];
            for (const path in projectsForDirectory) {
                projects.push({
                    path,
                    name: projectsForDirectory[path],
                });
            }

            return [
                {
                    api: {
                        key: requireOnObject(doc, "api_key"),
                        url: requireOnObject(doc, "api_server_host"),
                    },
                    uiURL: requireOnObject(doc, "ui_server_host"),
                    user: requireOnObject(doc, "user"),
                    projects,
                } satisfies EvergreenConfig,
                undefined,
            ];
        },
        (err) => {
            return [undefined, err];
        },
    );
}
