/* eslint-disable camelcase */
import { JSONClient } from "./json";
import type { EvergreenConfig } from "src/pkg/evergreen/config";
import type { V2Patch } from "src/pkg/evergreen/types/patch";
import { V2Version } from "src/pkg/evergreen/types/versions";

export class V2EvergreenClient extends JSONClient {
    constructor(config: EvergreenConfig) {
        super({
            baseURL: config.api.url.replace("/api", "/rest/v2"),
            headers: {
                "Api-Key": config.api.key,
                "Api-User": config.user,
            },
        });
    }

    public getUserPatches(userId: string) {
        return this.get<V2Patch[]>(`/users/${userId}/patches`);
    }

    public getProjectPatches(projectId: string) {
        return this.get<V2Patch[]>(`/projects/${projectId}/patches`);
    }

    public getProjectVersions(projectId: string) {
        return this.get<V2Version[]>(`/projects/${projectId}/versions`, {
            // Currently there is a bug in Evergreen that the tasks don't properly get included.
            include_builds: true,
            include_tasks: true,
        });
    }

    public getPatch(id: string) {
        return this.get<V2Patch>(`/patches/${id}`);
    }

    public restartPatch(id: string) {
        return this.post<V2Patch>(`/patches/${id}/restart`, undefined);
    }
}
