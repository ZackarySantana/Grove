import { JSONClient } from "./json";
import type { EvergreenConfig } from "src/pkg/evergreen/config";
import type { LegacyPatch, V2Patch } from "src/pkg/evergreen/types/patch";
import { V2Version } from "src/pkg/evergreen/types/versions";
import type { Either } from "src/types";

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

    public getUserPatches(userId: string): Promise<Either<V2Patch[], Error>> {
        return this.get<V2Patch[]>(`/users/${userId}/patches`);
    }

    public getProjectPatches(projectId: string) {
        return this.get<V2Patch[]>(`/projects/${projectId}/patches`);
    }

    public getProjectVersions(projectId: string) {
        return this.get<V2Version[]>(`/projects/${projectId}/versions`);
    }

    public getPatch(id: string): Promise<Either<LegacyPatch, Error>> {
        return this.get<LegacyPatch>(`/patches/${id}`);
    }
}
