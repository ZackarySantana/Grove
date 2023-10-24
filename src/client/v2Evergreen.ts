import { JSONClient } from "./json";
import type { EvergreenConfig } from "src/pkg/evergreen/config";
import type { Patch } from "src/pkg/evergreen/types/patch";
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

    public getPatch(id: string): Promise<Either<Patch, Error>> {
        return this.get<Patch>(`/patches/${id}`);
    }
}
