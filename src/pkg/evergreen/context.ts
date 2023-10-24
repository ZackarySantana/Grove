import { LegacyEvergreenClient } from "../../client/legacyEvergreen";
import { V2EvergreenClient } from "../../client/v2Evergreen";
import { EvergreenConfig, EvergreenProject } from "./config";
import type { Either } from "src/types";
import { WorkspaceFolder } from "vscode";

export type EvergreenContext = {
    currentProject: EvergreenProject;
    config: EvergreenConfig;
    clients: {
        legacy: LegacyEvergreenClient;
        v2: V2EvergreenClient;
    };
};

export function createEvergreenContext(
    evergreenConfig: EvergreenConfig,
    workspaceFolder: WorkspaceFolder,
): Either<EvergreenContext, Error> {
    const project = evergreenConfig.projects.find(
        (p) => p.path === workspaceFolder.uri.path,
    );
    if (project === undefined) {
        return [
            undefined,
            new Error(
                `Could not find the Evergreen project at ${workspaceFolder.uri.path}. Please add it to your Evergreen Config`,
            ),
        ];
    }

    return [
        {
            currentProject: {
                id: project.id,
                path: project.path,
            },
            config: evergreenConfig,
            clients: {
                legacy: new LegacyEvergreenClient(evergreenConfig),
                v2: new V2EvergreenClient(evergreenConfig),
            },
        } satisfies EvergreenContext,
        undefined,
    ];
}
