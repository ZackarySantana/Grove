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
};
