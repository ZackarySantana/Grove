import { Variant } from "src/client/graphqlEvergreen";
import { V2Patch } from "src/pkg/evergreen/types/patch";

function createTask(task: string) {
    return `<li>${task}</li>`;
}

function createVariant(variant: Variant) {
    return `
        <h1>${variant.displayName}</h1>
        <ul>
            ${variant.tasks.map(createTask).reduce((pv, item) => pv + item)}
        </ul>
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
<body>
    ${variants.map(createVariant).reduce((pv, item) => pv + item)}

    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const counter = document.getElementById('lines-of-code-counter');

            let count = 0;
            setInterval(() => {
                counter.textContent = count++;

                // Alert the extension when our cat introduces a bug
                if (Math.random() < 0.001 * count) {
                    vscode.postMessage({
                        command: 'alert',
                        text: '🐛  on line ' + count
                    })
                }
            }, 100);
        }())
    </script>
</body>
</html>`;
}
