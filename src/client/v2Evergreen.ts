/* eslint-disable camelcase */
import { JSONClient } from "./json";
import type { EvergreenConfig } from "src/pkg/evergreen/config";
import type {
    V2Patch,
    V2PatchWithVersionAndTasks,
} from "src/pkg/evergreen/types/patch";
import { Task } from "src/pkg/evergreen/types/task";
import { V2Version, V2VersionAndTasks } from "src/pkg/evergreen/types/version";
import { Either } from "src/types";

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
        return this.get<V2Patch[]>(`/users/${userId}/patches?limit=5`);
    }

    public getUserPatchesWithBuildsAndTasks(
        userId: string,
    ): Promise<Either<V2PatchWithVersionAndTasks[], Error>> {
        return this.get<V2Patch[]>(`/users/${userId}/patches?limit=5`).then(
            async ([patches, err]) => {
                if (err) {
                    return [undefined, err];
                }
                const promises: Promise<unknown>[] = [];
                const patchesWithBuildsAndTasks = patches.map((p) => {
                    const patch: V2PatchWithVersionAndTasks = p;

                    if (patch.status === "created") {
                        return patch;
                    }

                    promises.push(
                        this.getBuildsAndTasks(p.patch_id).then(([v, err]) => {
                            if (err) {
                                return err;
                            }
                            patch.versionAndTasks = v;
                            return undefined;
                        }),
                    );

                    return patch;
                });

                const errs = await Promise.all(promises);

                for (const err of errs) {
                    if (err instanceof Error) {
                        console.log(err);
                        return [undefined, err];
                    }
                }

                return [patchesWithBuildsAndTasks, undefined];
            },
        );
    }

    public getBuildsAndTasks(
        versionId: string,
    ): Promise<Either<V2VersionAndTasks, Error>> {
        return this.get<V2Version>(`/versions/${versionId}`).then(
            async ([v, err]) => {
                if (err) {
                    return [undefined, err];
                }
                const versionWithBuildAndTasks: V2VersionAndTasks = {
                    ...v,
                    tasks: [],
                };
                const promises: Promise<unknown>[] = [];
                v.build_variants_status.forEach((b) => {
                    promises.push(
                        this.get<Task[]>(`/builds/${b.build_id}/tasks`).then(
                            ([tasks, err]) => {
                                if (err) {
                                    return err;
                                }
                                versionWithBuildAndTasks.tasks.push(...tasks);
                                return undefined;
                            },
                        ),
                    );
                });

                const errs = await Promise.all(promises);

                for (const err of errs) {
                    if (err instanceof Error) {
                        return [undefined, err];
                    }
                }

                return [versionWithBuildAndTasks, undefined];
            },
        );
    }

    public getProjectPatches(projectId: string) {
        return this.get<V2Patch[]>(`/projects/${projectId}/patches?limit=5`);
    }

    public getProjectPatchesWithBuildsAndTasks(
        projectId: string,
    ): Promise<Either<V2PatchWithVersionAndTasks[], Error>> {
        return this.get<V2Patch[]>(`/projects/${projectId}/patches`).then(
            async ([patches, err]) => {
                if (err) {
                    return [undefined, err];
                }
                const promises: Promise<unknown>[] = [];
                const patchesWithBuildsAndTasks = patches.map((p) => {
                    const patch: V2PatchWithVersionAndTasks =
                        p as V2PatchWithVersionAndTasks;

                    promises.push(
                        this.getBuildsAndTasks(p.patch_id).then(([v, err]) => {
                            if (err) {
                                return err;
                            }
                            patch.versionAndTasks = v;
                            return undefined;
                        }),
                    );

                    return patch;
                });

                await Promise.all(promises);

                return [patchesWithBuildsAndTasks, undefined];
            },
        );
    }

    public getProjectVersions(projectId: string) {
        return this.get<V2Version[]>(
            `/projects/${projectId}/versions?limit=t`,
            {
                // Currently there is a bug in Evergreen that the tasks don't properly get included.
                include_builds: true,
                include_tasks: true,
            },
        );
    }

    public getPatch(id: string) {
        return this.get<V2Patch>(`/patches/${id}`);
    }

    public restartPatch(id: string) {
        return this.post<V2Patch>(`/patches/${id}/restart`, undefined);
    }
}
