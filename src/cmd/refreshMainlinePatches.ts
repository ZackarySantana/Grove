import type { GroveContext } from "src/types";

export function initRefreshMainlineVersions(context: GroveContext): () => void {
    return async () => {
        context.views.mainline_versions.refresh();
    };
}
