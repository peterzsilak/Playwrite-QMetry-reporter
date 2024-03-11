export interface CreateTestCycleRequestDto {

    summary: string;
    description: string;
    folderId: number;
    priority?: number;
    status: number;
    components?: Array<number>;
    labels: Array<number>;
    sprint?: number;
    fixVersions?: Array<number>;
    plannedStartDate: string;
    plannedEndDate: string;
    projectId: string;
    isAutomated: boolean;
}