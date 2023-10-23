import { JSONClient } from "@client/json";
import { EvergreenConfig } from "@evergreen/config";

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
}
