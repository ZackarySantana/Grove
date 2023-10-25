export type V2Version = {
    version_id: string;
    create_time: string;
    start_time: string;
    finish_time: string;
    revision: string;
    order: number;
    project: string;
    project_identifier: string;
    author: string;
    author_email: string;
    message: string;
    status: string;
    repo: string;
    branch: string;
    parameters: unknown;
    build_variants_status: {
        build_variant: string;
        build_id: string;
    }[];
    requester: string;
    errors: unknown;
    activated: boolean;
    aborted: boolean;
    git_tags: unknown;
    ignored: boolean;
};
