import { PatchChild, PatchTreeItemContext } from "./patches";

export function createCopyTextPatchChild(
    context: PatchTreeItemContext,
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
    context: PatchTreeItemContext,
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
