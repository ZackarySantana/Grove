import { GroveContext } from "src/types";
import { PatchChild } from "./patches";

export function createCopyTextPatchChild(
    context: GroveContext,
    label: string,
    textToCopy: string,
): PatchChild {
    const child = new PatchChild(context, label.replace("%s", textToCopy));
    child.command = {
        command: "grove.copyText",
        title: "Copy Text",
        arguments: [textToCopy],
    };
    return child;
}

export function createOpenLinkPatchChild(
    context: GroveContext,
    label: string,
    link: string,
): PatchChild {
    const child = new PatchChild(context, label);
    child.command = {
        command: "grove.openLink",
        title: label,
        arguments: [link],
    };
    return child;
}
