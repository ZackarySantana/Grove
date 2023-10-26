import type { GroveContext } from "src/types";

export function initRefreshProjectPatches(context: GroveContext) {
    return async () => {
        context.views.project_patches.refresh();
    };
}
