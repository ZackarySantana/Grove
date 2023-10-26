import { GroveContext } from "src/types";
import { VersionsProvider } from "./versions";

export class MainlinePatchesProvider extends VersionsProvider {
    constructor(context: GroveContext) {
        super(context);
    }
}
