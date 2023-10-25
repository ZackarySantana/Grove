/* eslint-disable camelcase */
export function getRequesterName(requester: string) {
    const requesterTypes: { [key: string]: string } = {
        github_pull_request: "PR",
        patch_request: "CLI",
    };
    if (requester in requesterTypes) {
        return `${requesterTypes[requester]} (${requester})`;
    }
    return requester;
}
