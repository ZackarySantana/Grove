import { GroveContext } from "src/types";
import { PatchesProvider } from "./patches";

export class MainlinePatchesProvider extends PatchesProvider {
    constructor(context: GroveContext) {
        super(context);
        this.retrievePatches = () =>
            context.evergreen.clients.v2.getProjectPatches(
                context.evergreen.currentProject.id,
            );
    }
}
