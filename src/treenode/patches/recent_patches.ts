import { GroveContext } from "src/types";
import { PatchesProvider } from "./patches";

export class RecentPatchesProvider extends PatchesProvider {
    constructor(context: GroveContext) {
        super(context);
    }
}
