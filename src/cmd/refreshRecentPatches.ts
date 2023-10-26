import type { GroveContext } from "src/types";

export function initRefreshRecentPatches(context: GroveContext) {
    return async () => {
        context.views.recent_patches.refresh();
    };
}
