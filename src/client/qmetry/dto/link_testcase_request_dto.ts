export interface LinkTestCaseRequestDto {
    testCases: { id: string, versionNo: number }[];
    sort: string;
}
