// v2 API /users/{user_id}/patches
export type V2UserPatch = {
    patch_id: string;
    description: string;
    project_id: string;
    project_identifier: string;
    branch: string;
    git_hash: string;
    patch_number: number;
    hidden: boolean;
    author: string;
    version: string;
    status: string;
    create_time: string;
    start_time: string;
    finish_time: string;
    builds: string[];
    tasks: string[];
    downstream_tasks: unknown;
    variants_tasks: {
        name: string;
        tasks: string[];
    }[];
    activated: boolean;
    alias: string;
    github_patch_data: {
        pr_number: number;
        base_owner: string;
        base_repo: string;
        head_owner: string;
        head_repo: string;
        head_hash: string;
        author: string;
    };
    module_code_changes: {
        branch_name: string;
        html_link: string;
        raw_link: string;
        commit_messages: string;
        file_diffs: {
            file_name: string;
            additions: number;
            deletions: number;
            diff_link: string;
            description: string;
        }[];
    }[];
    parameters: unknown;
    project_storage_method: string;
    can_enqueue_to_commit_queue: boolean;
    child_patches: unknown;
    requester: string;
    merged_from: string;
};

// legacy API /patches/mine?n=x
export type LegacyPatch = {
    Id: string;
    Description: string;
    Path: string;
    Project: string;
    Githash: string;
    Hidden: boolean;
    PatchNumber: number;
    Author: string;
    Version: string;
    Status: string;
    CreateTime: string;
    StartTime: string;
    FinishTime: string;
    BuildVariants: string[];
    Tasks: string[];
    Patches: {
        ModuleName: string;
        Githash: string;
        PatchSet: {
            Patch: string;
            PatchFileId: string;
            CommitMessages: string;
            Summary: {
                Name: string;
                Additions: number;
                Deletions: number;
                Description: string;
            }[];
        };
        IsMbox: boolean;
    }[];
    Activated: boolean;
    ProjectStorageMethod: string;
    PatchedProjectConfig: string;
    Alias: string;
    MergePatch: string;
    GithubPatchData: {
        PRNumber: number;
        BaseOwner: string;
        BaseRepo: string;
        BaseBranch: string;
        HeadOwner: string;
        HeadRepo: string;
        HeadHash: string;
        Author: string;
        AuthorUID: number;
        MergeCommitSHA: string;
        CommitTitle: string;
        CommitMessage: string;
        RepeatPatchIdNextPatch: string;
    };
    GithubMergeData: {
        Org: string;
        Repo: string;
        BaseBranch: string;
        HeadBranch: string;
        HeadSHA: string;
    };
    GitInfo: {
        username: string;
        email: string;
        git_version: string;
    };
    DisplayNewUI: boolean;
    merge_status: string;
    MergedFrom: string;
};
