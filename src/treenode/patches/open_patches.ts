import { GroveContext } from "src/types";
import { PatchesProvider } from "./patches";

export class OpenPatchesProvider extends PatchesProvider {
    constructor(context: GroveContext) {
        super(context);
        this.filter = (p) => p.status === "created" || p.status === "started";
    }
}
