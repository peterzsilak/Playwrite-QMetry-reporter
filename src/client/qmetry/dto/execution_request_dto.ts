export interface ExecutionRequestDto {
    executionResultId: number;
    testCycleTestCaseMapIds: Array<number>;
    environmentId: number;
    doPropagateExecutionResultOnSteps?: boolean;
}
