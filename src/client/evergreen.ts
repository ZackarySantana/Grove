import { JSONClient } from "./json";
import { EvergreenConfig } from "src/pkg/evergreen/config";
import { Patch } from "src/pkg/evergreen/types/patch";
import { Either } from "src/types";

export class EvergreenClient extends JSONClient {
    constructor(config: EvergreenConfig) {
        super({
            baseURL: config.api.url,
            headers: {
                "Api-Key": config.api.key,
                "Api-User": config.user,
            },
        });
    }

    public getRecentPatches(): Promise<Either<Patch[], Error>> {
        return this.get<Patch[]>("/patches/mine?n=10");
    }
}
