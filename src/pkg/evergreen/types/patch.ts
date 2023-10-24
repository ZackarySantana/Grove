export type Patch = {
    Id: string;
    Version: string;

    Project: string;
    Author: string;
    Description: string;
    PatchNumber: number;

    CreateTime: Date;
    StartTime: Date;
    FinishTime: Date;
    Status: string;
    Activated: boolean;

    Patches: {
        Githash: string;
        IsMBox: boolean;
        ModuleName: string;
        PatchSet: {
            CommitMessages?: string;
            Patch: string;
            PatchFileId: string;
            Summary: {
                Additions: number;
                Deletions: 0;
                Description: string;
                Name: string; // file name
            }[];
        };
    }[];
};
