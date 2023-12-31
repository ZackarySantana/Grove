import { GroveContext } from "src/types";
import { PatchesProvider } from "./patches";
import { createCopyTextPatchChild } from "./helpers";
import { V2Patch } from "src/pkg/evergreen/types/patch";

export class ProjectPatchesProvider extends PatchesProvider {
    constructor(context: GroveContext) {
        super(context);
        this.retrievePatches = () =>
            context.evergreen.clients.v2.getProjectPatchesWithBuildsAndTasks(
                context.evergreen.currentProject.id,
            );

        this.additionalDetails = (patch: V2Patch) => {
            return [
                createCopyTextPatchChild(
                    this.contextWithView,
                    `Author: ${patch.author}`,
                    patch.author,
                ),
            ];
        };
    }
}
