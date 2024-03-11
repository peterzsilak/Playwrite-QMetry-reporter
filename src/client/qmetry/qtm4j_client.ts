import {environment} from "../../config/environment";

import {AxiosResponse} from "axios";
import {AddTestCycleToTestPlanResponseDto} from "./dto/add_test_cycle_to_test_plan_response_dto";
import {AttachmentUploadPolicyResponseDto} from "./dto/attachment_upload_policy_response_dto";
import {CreateTestCycleRequestDto} from "./dto/create_test_cycle_request_dto";
import {CreateTestCycleResponseDto} from "./dto/create_test_cycle_response_dto";
import {ExecutionRequestDto} from './dto/execution_request_dto';
import {Filter} from "./dto/filter";
import {GetAttachmentResponseDto} from "./dto/get_testcase_attachment_response_dto";
import {LinkTestCaseRequestDto} from "./dto/link_testcase_request_dto";
import {LinkTestCaseResponseDto} from "./dto/link_testcase_response_dto";
import {QTM4JInterface} from "./qtm4j_interface";
import {RestClient} from "../rest_client";
import {UpdateTestCycleRequestDto} from "./dto/update_testcycle_request_dto";
import {SearchTestCaseResponseDto} from "./dto/search_testcase_response_dto";

export class QTM4JClient extends RestClient implements QTM4JInterface {

    private projectId: number = environment.qmetry.projectId;

    constructor() {
        super(
            environment.qmetry.baseurl,
            {
                "Content-Type": "application/json",
                "apikey": environment.qmetry.apikey
            }
        );
    }

    public async createTestCycle(createTestCycleRequestDto: CreateTestCycleRequestDto): Promise<CreateTestCycleResponseDto> {
        const response: AxiosResponse = await this.client.post('/testcycles', createTestCycleRequestDto);
        return response.data;
    }

    public async updateTestCycle(testCycleId: string, updateTestCycleRequestDto: UpdateTestCycleRequestDto): Promise<AxiosResponse> {
        return await this.client.put(`/testcycles/${testCycleId}`, updateTestCycleRequestDto);
    }

    public async searchTestCase(startAt?: number, maxResults?: number, filter?: Filter): Promise<SearchTestCaseResponseDto> {
        const payload = {"filter": filter};
        const response: AxiosResponse = await this.client.post(`/testcases/search/?startAt=${startAt}&maxResults=${maxResults}&sort=key%3Aasc`, payload);
        return response.data;
    }

    public async linkTestCycleToTestPlan(testPlanId: string, testCycleId: string): Promise<AddTestCycleToTestPlanResponseDto> {
        const payload = {testcycleIds: [testCycleId]};
        const response: AxiosResponse = await this.client.put(`/testplans/${testPlanId}/testcycles`, payload);
        return response.data;
    }

    public async linkTestCaseToTestCycle(testCycleId: string, linkTestCaseRequestDto: LinkTestCaseRequestDto): Promise<AxiosResponse> {
        return await this.client.post(`/testcycles/${testCycleId}/testcases`, linkTestCaseRequestDto);
    }

    public async unlinkTestCaseFromTestCycle(testCycleId: string, testCaseId: string): Promise<AxiosResponse> {
        return await this.client.delete(`/testcycles/${testCycleId}/unlinktestcase/${testCaseId}`);
    }

    public async getLinkedTestCasesOfTestCycle(testCycleId: string, startAt: number, maxResults: number, filter: Filter): Promise<LinkTestCaseResponseDto> {
        const payload = {"filter": filter};
        const response: AxiosResponse = await this.client.post(`/testcycles/${testCycleId}/testcases/search/?startAt=${startAt}&maxResults=${maxResults}&sort=key%3Aasc`, payload);
        return response.data;
    }

    public async sendExecutionResult(testCycleId: string, executionRequestDto: ExecutionRequestDto): Promise<AxiosResponse> {
        return await this.client.put(`/testcycles/${testCycleId}/testcases/bulk`, executionRequestDto);
    }

    public async getAttachmentUploadPolicy(testCycleId: string, testcaseExecutionId: number, filename: string): Promise<AttachmentUploadPolicyResponseDto> {
        const response: AxiosResponse = await this.client.get(`/testcycles/${testCycleId}/testcase-executions/attachments/url/?fileName=${filename}&projectId=${this.projectId}&testcaseExecutionId=${testcaseExecutionId}`);
        return response.data;
    }

    public async getAttachmentsOfTestCase(testCycleId: string, testcaseExecutionId: number): Promise<GetAttachmentResponseDto> {
        const response: AxiosResponse = await this.client.get(`/testcycles/${testCycleId}/testcase-executions/${testcaseExecutionId}/attachments`);
        return response.data;
    }
}
