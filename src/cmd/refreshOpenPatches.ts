import type { GroveContext } from "src/types";

export function initRefreshOpenPatches(context: GroveContext): () => void {
    return async () => {
        context.views.open_patches.refresh();
    };
}
