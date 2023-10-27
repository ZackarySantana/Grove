/* eslint-disable max-lines-per-function */
import { Variant } from "src/client/graphqlEvergreen";
import { V2Patch } from "src/pkg/evergreen/types/patch";

function createTask(variant: string, task: string) {
    return `
        <li>
            <input type="checkbox" id="${task}" class="${variant}">
            ${task}
        </li>
    `;
}

function createVariant(variant: Variant) {
    return `
        <details style="margin-bottom: 10px;">
            <summary style="font-size: 2em">
                <input type="checkbox" id="${variant.name}">
                <span id="${variant.name}-name">${variant.displayName}</span>
            </summary>
            <ul>
                ${variant.tasks
                    .map((t) => createTask(variant.name, t))
                    .reduce((pv, item) => pv + item)}
            </ul>
        </details>
    `;
}

export function getConfigurePatchWebview(patch: V2Patch, variants: Variant[]) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body style="margin: 50px;">
    <h1>Configure patch ${patch.description}</h1>

    ${variants.map(createVariant).join("\n")}

    <span>Close this window to configure and start your patch. If you do not select any tests, this will cancel the action</span>
    <!--
    <div class="flex gap-10">
        <button>Configure and Start</button>
        <button>Configure and Start</button>
    </div>
    -->

    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const variants = JSON.parse(\`${JSON.stringify(variants)}\`);

            const getItems = () => {
                const variantsWithTasks = [];

                for (const variant of variants) {
                    const v = { displayName: variant.displayName, name: variant.name, tasks: [] };
                    document.querySelectorAll("." + v.name).forEach((e) => {
                        if (e.checked) {
                            v.tasks.push(e.id);
                        }
                    });
                    variantsWithTasks.push(v);
                }

                return variantsWithTasks;
            }

            const updateVariantName = (variant) => {
                let checked = 0;
                let exists = 0;
                document.querySelectorAll("." + variant.name).forEach((e) => {
                    ++exists;
                    if (e.checked) {
                        ++checked;
                    }
                });

                document.querySelector("#" + variant.name + "-name").innerHTML = variant.displayName + " (" + checked + "/" + exists + ")";
            }

            const postItems = () => {
                vscode.postMessage(getItems());
            }

            for (const variant of variants) {
                document.querySelector("#" + variant.name)?.addEventListener("change", (event) => {
                    document.querySelectorAll("." + variant.name).forEach((e) => {
                        e.checked = event.target.checked;
                    });
                    updateVariantName(variant);
                    postItems();
                });
                document.querySelectorAll("." + variant.name).forEach((e) => e.addEventListener("change", () => {
                    updateVariantName(variant);
                    postItems();
                }));
                updateVariantName(variant);
            }

        }())
    </script>
</body>
</html>`;
}
