import { JSONClient } from "./json";
import type { EvergreenConfig } from "src/pkg/evergreen/config";
import type { LegacyPatch } from "src/pkg/evergreen/types/patch";
import type { Either } from "src/types";
import axios, { AxiosError } from "axios";

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getPatchFileDiff(url: string): Promise<Either<any, Error>> {
        return axios
            .get(url, {
                headers: { ...this.headers },
                responseType: "arraybuffer",
            })
            .then(
                (response) =>
                    [response.data, undefined] as Either<string, Error>,
            )
            .catch((err) => {
                if (err instanceof AxiosError) {
                    return [undefined, err.response?.data ?? err];
                }
                if (err instanceof Error) {
                    return [undefined, err];
                }
                return [undefined, Error(String(err))];
            });
    }
}
