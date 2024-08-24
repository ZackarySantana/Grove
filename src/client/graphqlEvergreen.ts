/* eslint-disable camelcase */
import { Either } from "src/types";
import { JSONClient } from "./json";
import type { EvergreenConfig } from "src/pkg/evergreen/config";

export type Variant = {
    displayName: string;
    name: string;
    tasks: string[];
};

export class GraphQLEvergreenClient extends JSONClient {
    constructor(config: EvergreenConfig) {
        super({
            baseURL: config.api.url.replace("/api", "/graphql/query"),
            headers: {
                "Api-Key": config.api.key,
                "Api-User": config.user,
            },
        });
    }

    public getPatchPotentialBuildsAndTasks(
        id: string,
    ): Promise<Either<Variant[], Error>> {
        const query = `
        query Patch($patchId: String!) {
            patch(patchId: $patchId) {
                project {
                    variants {
                        displayName
                        name
                        tasks
                    }
                }
            }
        }
       `;
        return this.post<{
            data: { patch: { project: { variants: Variant[] } } };
        }>("", { query, variables: { patchId: id } }).then(([q, err]) => {
            if (err) {
                return [undefined, err];
            }

            return [q.data.patch.project.variants, undefined];
        });
    }
}
