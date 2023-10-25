import { JSONClient } from "./json";
import type { EvergreenConfig } from "src/pkg/evergreen/config";
import type { LegacyPatch, V2UserPatch } from "src/pkg/evergreen/types/patch";
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

    public getUserPatches(
        userId: string,
    ): Promise<Either<V2UserPatch[], Error>> {
        return this.get<V2UserPatch[]>(`/users/${userId}/patches`);
    }

    public getPatch(id: string): Promise<Either<LegacyPatch, Error>> {
        return this.get<LegacyPatch>(`/patches/${id}`);
    }
}
