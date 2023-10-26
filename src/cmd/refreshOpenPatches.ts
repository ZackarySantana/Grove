import type { GroveContext } from "src/types";

export function initRefreshOpenPatches(context: GroveContext) {
    return async () => {
        context.views.open_patches.refresh();
    };
}
