import {AxiosResponse} from "axios";
import {AddTestCycleToTestPlanResponseDto} from "./dto/add_test_cycle_to_test_plan_response_dto";
import {AttachmentUploadPolicyResponseDto} from "./dto/attachment_upload_policy_response_dto";
import {CreateTestCycleRequestDto} from "./dto/create_test_cycle_request_dto";
import {CreateTestCycleResponseDto} from "./dto/create_test_cycle_response_dto";
import {ExecutionRequestDto} from "./dto/execution_request_dto";
import {Filter} from "./dto/filter";
import {LinkTestCaseRequestDto} from "./dto/link_testcase_request_dto";
import {LinkTestCaseResponseDto} from "./dto/link_testcase_response_dto";
import {UpdateTestCycleRequestDto} from "./dto/update_testcycle_request_dto";
import {SearchTestCaseResponseDto} from "./dto/search_testcase_response_dto";
import {GetAttachmentResponseDto} from "./dto/get_testcase_attachment_response_dto";

export interface QTM4JInterface {

    createTestCycle(createTestCycleRequestDto: CreateTestCycleRequestDto): Promise<CreateTestCycleResponseDto>;

    getAttachmentUploadPolicy(testCycleId: string, testcaseExecutionId: number, filename: string): Promise<AttachmentUploadPolicyResponseDto>;

    getLinkedTestCasesOfTestCycle(testCycleId: string, startAt: number, maxResults: number, filter: Filter): Promise<LinkTestCaseResponseDto>;

    getAttachmentsOfTestCase(testCycleId: string, testcaseExecutionId: number): Promise<GetAttachmentResponseDto>;

    linkTestCycleToTestPlan(testPlanId: string, testCycleId: string): Promise<AddTestCycleToTestPlanResponseDto>;

    linkTestCaseToTestCycle(testCycleId: string, linkTestCaseRequestDto: LinkTestCaseRequestDto): Promise<AxiosResponse>;

    searchTestCase(startAt?: number, maxResults?: number, filter?: Filter): Promise<SearchTestCaseResponseDto>;

    sendExecutionResult(testCycleId: string, executionRequestDto: ExecutionRequestDto): Promise<AxiosResponse>;

    unlinkTestCaseFromTestCycle(testCycleId: string, testCaseId: string): Promise<AxiosResponse>;

    updateTestCycle(testCycleId: string, updateTestCycleRequestDto: UpdateTestCycleRequestDto): Promise<AxiosResponse>;


}