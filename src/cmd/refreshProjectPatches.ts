import type { GroveContext } from "src/types";

export function initRefreshProjectPatches(context: GroveContext): () => void {
    return async () => {
        context.views.project_patches.refresh();
    };
}
