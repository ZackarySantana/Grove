import { JSONClient } from "./json";
import type { EvergreenConfig } from "src/pkg/evergreen/config";
import type { LegacyPatch } from "src/pkg/evergreen/types/patch";
import type { Either } from "src/types";

export class LegacyEvergreenClient extends JSONClient {
    constructor(config: EvergreenConfig) {
        super({
            baseURL: config.api.url,
            headers: {
                "Api-Key": config.api.key,
                "Api-User": config.user,
            },
        });
    }

    public getRecentPatches(): Promise<Either<LegacyPatch[], Error>> {
        return this.get<LegacyPatch[]>("/patches/mine?n=10");
    }

    public getPatch(id: string): Promise<Either<LegacyPatch, Error>> {
        return this.get<{ patch: LegacyPatch }>(`/patches/${id}`).then(
            ([p, err]) => {
                if (err !== undefined) {
                    return [p, err];
                }
                return [p.patch, err];
            },
        );
    }
}
