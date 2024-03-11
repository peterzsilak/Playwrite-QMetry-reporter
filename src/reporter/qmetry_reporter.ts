import {environment} from "../config/environment";

import * as fs from "fs";

import {AxiosResponse} from "axios";
import {AttachmentDto} from "../client/qmetry/dto/attachment_dto";
import {AttachmentType} from "../client/qmetry/enum/attachment_type";
import {AttachmentUploadPolicyResponseDto} from "../client/qmetry/dto/attachment_upload_policy_response_dto";
import {CreateTestCycleRequestDto} from "../client/qmetry/dto/create_test_cycle_request_dto";
import {CreateTestCycleResponseDto} from "../client/qmetry/dto/create_test_cycle_response_dto";
import {DateHelper} from "../helper/date_helper";
import {ExecutionRequestDto} from "../client/qmetry/dto/execution_request_dto";
import {ExecutionResults} from "../client/qmetry/enum/execution_result";
import {Filter} from "../client/qmetry/dto/filter";
import {FullResult, Reporter, Suite, TestCase, TestResult, TestStatus} from "@playwright/test/reporter";
import {FullConfig} from "@playwright/test";
import {LinkedTestCase} from "../client/qmetry/dto/linked_testcase";
import {LinkTestCaseRequestDto} from "../client/qmetry/dto/link_testcase_request_dto";
import {LinkTestCaseResponseDto} from "../client/qmetry/dto/link_testcase_response_dto";
import {QTM4JClient} from "../client/qmetry/qtm4j_client";
import {QTM4JInterface} from "../client/qmetry/qtm4j_interface";
import {QTM4JAwsClient} from "../client/qmetry/qtm4j_aws_client";
import {QTM4JAwsInterface} from "../client/qmetry/qtm4j_aws_interface";
import {SearchTestCaseResponseDto} from "../client/qmetry/dto/search_testcase_response_dto";
import {Testcase} from "../client/qmetry/dto/testcase";
import {TestCycleStatus} from "../client/qmetry/enum/test_cycle_status";
import {UpdateTestCycleRequestDto} from "../client/qmetry/dto/update_testcycle_request_dto";
import {AttachmentData, GetAttachmentResponseDto} from "../client/qmetry/dto/get_testcase_attachment_response_dto";

export default class QmetryReporter implements Reporter {

    private IS_CI_RUN: string = process.env.CI;

    private qMetryInterface: QTM4JInterface;
    private qtm4JAwsInterface: QTM4JAwsInterface;

    private testCaseStorage: LinkedTestCase[] = [];
    private testCycle: CreateTestCycleResponseDto;
    private testCaseIndex: Record<string, LinkedTestCase> = {};

    constructor() {
        this.qMetryInterface = new QTM4JClient();
        this.qtm4JAwsInterface = new QTM4JAwsClient();
    }

    async onBegin(config: FullConfig, suite: Suite): Promise<void> {
        const {localSummary, description} = this.generateDataForTestCycle(suite);
        this.testCycle = await this.createTestCycle(localSummary, description);
        console.log(
            localSummary + '\n'
            + description + '\n'
            + `Test Cycle created with: ${this.testCycle.key}\n`
        );
        await this.addTestCycleToTestPlan();
    }

    private generateDataForTestCycle(suite: Suite) {
        const suites: Suite[] = suite.suites;
        let testSuiteTitles: string[] = [];
        let testSuiteTitle: string;
        let localSummary: string;
        let description: string;

        for (let i: number = 0; i < suites.length; i++) {
            testSuiteTitles.push(suites[i].title);
            testSuiteTitle = suites.length > 1 ? testSuiteTitles.join(', ').toString() : testSuiteTitles.toString();
        }

        if (this.IS_CI_RUN) {
            localSummary = environment.qmetry.ciSummary;
            description = `Test suite(s): ${testSuiteTitles}`;
            return {localSummary, description};
        } else {
            const nodeenv: string = process.env.NODE_ENV;
            localSummary = `ADHOC testing of ${testSuiteTitles.toString().toUpperCase()} test suite on ${nodeenv.toUpperCase()} environment`;
            description = `Test suite(s): ${testSuiteTitles}`;
            return {localSummary, description};
        }
    }

    onTestBegin(test: TestCase, result: TestResult): void {
        this.storeTestCaseInTestCaseStorage(test, result);
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        this.storeTestResultInTestCaseStorage(test, result);
    }

    async onEnd(result: FullResult): Promise<void> {
        await this.storeTestCaseDetailsInTestCaseStorage();
        await this.linkTestCasesToExistingTestCycle();
        await this.updateTestCaseDetailsInTestCaseStorage();
        await this.uploadTestResultsToTestCycle();
        await this.uploadEvidencesToQMetry();
        await this.closeTestCycle();
    }

    private async createTestCycle(localSummary: string, description: string): Promise<CreateTestCycleResponseDto> {
        const dateHelper: DateHelper = new DateHelper();
        const createTestCycleRequestDto: CreateTestCycleRequestDto = {
            summary: this.IS_CI_RUN ? environment.qmetry.ciSummary : localSummary,
            description: description,
            folderId: environment.env.qmetryFolderId,
            status: TestCycleStatus.IN_PROGRESS,
            labels: environment.qmetry.labels,
            plannedStartDate: dateHelper.formatDateTime(new Date()),
            plannedEndDate: dateHelper.getTomorrowsDateTime(),
            projectId: environment.qmetry.projectId.toString(),
            isAutomated: true,
        };
        return await this.qMetryInterface.createTestCycle(createTestCycleRequestDto);
    }

    private async addTestCycleToTestPlan(): Promise<void> {
        const testPlanId: string = this.IS_CI_RUN ? environment.env.qmetryTestPlanId : environment.qmetry.adhocTestRunTestPlanId;
        await this.qMetryInterface.linkTestCycleToTestPlan(testPlanId, this.testCycle.id);
    }

    private storeTestCaseInTestCaseStorage(test: TestCase, result: TestResult): void {
        const testCaseKey: string = this.getTestCaseKey(test.title);
        const testCaseKeyNotStoredLocally: boolean = !this.containsLinkedTestCase(this.testCaseStorage, testCaseKey);
        if (testCaseKeyNotStoredLocally) {
            const testcase: LinkedTestCase = {
                key: testCaseKey,
                projectId: environment.qmetry.projectId,
                status: result.status,
            };
            this.testCaseStorage.push(testcase);
        }
        this.buildIndex(this.testCaseStorage);
    }

    private getTestCaseKey(title: string): string {
        const pattern: RegExp = /\[(.*?)\]/;
        const matches: RegExpMatchArray = title.match(pattern);

        if (matches && matches.length > 1) {
            return matches[1];
        } else {
            console.log(`There is no TestCase key in the title: ${title}.`);
            return "";
        }
    }

    private containsLinkedTestCase(testCaseStorage: LinkedTestCase[], testCaseKey: string): boolean {
        return testCaseStorage.some((testCase) => testCase.key === testCaseKey);
    }

    private buildIndex(testCaseStorage: LinkedTestCase[]): void {
        for (const linkedTestCase of testCaseStorage) {
            if (linkedTestCase.key) {
                this.testCaseIndex[linkedTestCase.key] = linkedTestCase;
            }
        }
    }

    private storeTestResultInTestCaseStorage(test: TestCase, result: TestResult) {
        const testCaseKey: string = this.getTestCaseKey(test.title);
        const testCase: LinkedTestCase = this.testCaseIndex[testCaseKey];
        if (testCase) {
            if (test.outcome() === "flaky") {
                testCase.status = ExecutionResults.FLAKY;
            } else {
                testCase.status = this.getQMetryResultBasedOnPlaywright(result.status);
            }
        }
        if (result.attachments) {
            if (!testCase.attachments) {
                testCase.attachments = [];
            }
            testCase.attachments.push(...result.attachments);
        }
    }

    private getQMetryResultBasedOnPlaywright(status: TestStatus): ExecutionResults {
        const mapping: Record<TestStatus, ExecutionResults> = {
            failed: ExecutionResults.FAILED,
            interrupted: ExecutionResults.BLOCKED,
            passed: ExecutionResults.PASSED,
            skipped: ExecutionResults.NOT_EXECUTED,
            timedOut: ExecutionResults.FAILED,
        };
        return mapping[status];
    }

    private async storeTestCaseDetailsInTestCaseStorage() {
        const filter: Filter = {
            projectId: environment.qmetry.projectId.toString()
        };
        const totalTestCases: number = await this.getTotalTestCasesCount(filter);
        const pageSize: number = 50;
        const totalPages: number = Math.ceil(totalTestCases / pageSize);

        const testCaseIndex: { [key: string]: Testcase } = {};
        const testCaseUpdates: { [key: string]: Partial<LinkedTestCase> } = {};

        for (let currentPage = 0; currentPage < totalPages; currentPage++) {
            const startAt: number = currentPage * pageSize;
            const testCases: Testcase[] = await this.getTestCases(startAt, pageSize, filter);

            for (const testCase of testCases) {
                testCaseIndex[testCase.key] = testCase;
            }

            for (const storedTestCase of this.testCaseStorage) {
                const testCase = testCaseIndex[storedTestCase.key];
                if (testCase) {
                    testCaseUpdates[testCase.key] = {
                        id: testCase.id,
                        archived: testCase.archived,
                        versionNo: testCase.version.versionNo,
                        projectId: testCase.projectId,
                        key: testCase.key
                    };
                }
            }
        }

        for (const testCase of this.testCaseStorage) {
            const updates = testCaseUpdates[testCase.key];
            if (updates) {
                Object.assign(testCase, updates);
            }
        }
    }

    private async getTotalTestCasesCount(filter: Filter): Promise<number> {
        const searchTestCaseResponseDto: SearchTestCaseResponseDto = await this.qMetryInterface.searchTestCase(0, 0, filter);
        return searchTestCaseResponseDto.total;
    }

    private async getTestCases(startAt: number, maxResults: number, filter: Filter): Promise<Testcase[]> {
        const searchTestCaseResponseDto: SearchTestCaseResponseDto = await this.qMetryInterface.searchTestCase(startAt, maxResults, filter);
        return searchTestCaseResponseDto.data;
    }

    private async linkTestCasesToExistingTestCycle(): Promise<void> {
        const batchSize: number = 50;
        const totalTestCases: number = this.testCaseStorage.length;
        const totalBatches: number = Math.ceil(totalTestCases / batchSize);

        for (let i: number = 0; i < totalBatches; i++) {
            const start: number = i * batchSize;
            const end: number = start + batchSize;
            const batchTestCases: LinkedTestCase[] = this.testCaseStorage.slice(start, end);

            const testCaseData = batchTestCases.map(linkedTestCase => ({
                id: linkedTestCase.id,
                versionNo: linkedTestCase.versionNo
            }));
            await this.linkTestCasesBatchToTestCycle(testCaseData);
        }
    }

    async linkTestCasesBatchToTestCycle(testCaseData: { id: string, versionNo: number }[]): Promise<AxiosResponse> {
        const requestData: LinkTestCaseRequestDto = {
            testCases: testCaseData,
            sort: "key:ASC"
        };
        return await this.qMetryInterface.linkTestCaseToTestCycle(this.testCycle.id, requestData);
    }

    private async updateTestCaseDetailsInTestCaseStorage() {
        const totalLinkedTestCases: number = await this.getTotalLinkedTestCasesCount(this.testCycle.id);
        const pageSize: number = 50;
        const totalPages: number = Math.ceil(totalLinkedTestCases / pageSize);

        const testCaseIndex: { [key: string]: LinkedTestCase } = {};
        const testCaseUpdates: { [key: string]: Partial<LinkedTestCase> } = {};

        for (let currentPage = 0; currentPage < totalPages; currentPage++) {
            const startAt: number = currentPage * pageSize;
            const linkedTestCases: LinkedTestCase[] = await this.getLinkedTestCases(this.testCycle.id, startAt, pageSize);

            for (const linkedTestCase of linkedTestCases) {
                testCaseIndex[linkedTestCase.key] = linkedTestCase;
            }

            for (const testCase of this.testCaseStorage) {
                const linkedTestCase = testCaseIndex[testCase.key];
                if (linkedTestCase) {
                    testCaseUpdates[testCase.key] = {
                        testCycleTestCaseMapId: linkedTestCase.testCycleTestCaseMapId,
                        id: linkedTestCase.id,
                        testCaseExecutionId: linkedTestCase.testCaseExecutionId,
                        versionNo: linkedTestCase.versionNo,
                        priority: linkedTestCase.priority,
                        projectId: linkedTestCase.projectId,
                        archived: linkedTestCase.archived
                    };
                }
            }
        }

        for (const testCase of this.testCaseStorage) {
            const updates = testCaseUpdates[testCase.key];
            if (updates) {
                Object.assign(testCase, updates);
            }
        }
    }

    private async getTotalLinkedTestCasesCount(testCycleId: string): Promise<number> {
        const filter: Filter = {};
        const linkTestCaseResponseDto: LinkTestCaseResponseDto = await this.qMetryInterface.getLinkedTestCasesOfTestCycle(testCycleId, 0, 0, filter);
        return linkTestCaseResponseDto.total;
    }

    private async getLinkedTestCases(testCycle: string, startAt: number, maxResults: number): Promise<LinkedTestCase[]> {
        const filter: Filter = {};
        const linkTestCaseResponseDto = await this.qMetryInterface.getLinkedTestCasesOfTestCycle(testCycle, startAt, maxResults, filter);
        return linkTestCaseResponseDto.data;
    }

    private async uploadTestResultsToTestCycle(): Promise<void> {
        await this.filterAndUploadByExecutionResult(ExecutionResults.NOT_EXECUTED);
        await this.filterAndUploadByExecutionResult(ExecutionResults.FAILED);
        await this.filterAndUploadByExecutionResult(ExecutionResults.FLAKY);
        await this.filterAndUploadByExecutionResult(ExecutionResults.PASSED);
    }

    private async filterAndUploadByExecutionResult(executionResult: ExecutionResults) {
        const filteredTests: Array<LinkedTestCase> = this.filterTestCases(executionResult);
        if (filteredTests) {
            await this.uploadTestResultsToQMetry(filteredTests, executionResult);
        }
    }

    private filterTestCases(executionResult: ExecutionResults): Array<LinkedTestCase> {
        return this.testCaseStorage.filter(value => value.status === executionResult);
    }

    private async uploadTestResultsToQMetry(filteredTestCases: LinkedTestCase[], executionResult: ExecutionResults): Promise<void> {
        const batchSize: number = 50;
        const totalTestCases: number = filteredTestCases.length;
        const totalBatches: number = Math.ceil(totalTestCases / batchSize);

        for (let i: number = 0; i < totalBatches; i++) {
            const start: number = i * batchSize;
            const end: number = start + batchSize;
            const batchTestCases: LinkedTestCase[] = filteredTestCases.slice(start, end);

            const testCycleTestCaseMapIds: number[] = batchTestCases.map(
                testCase => testCase.testCycleTestCaseMapId
            );

            const executionRequestDto: ExecutionRequestDto = {
                executionResultId: executionResult,
                testCycleTestCaseMapIds: testCycleTestCaseMapIds,
                environmentId: environment.env.qmetryEnvironmentId,
            }

            await this.qMetryInterface.sendExecutionResult(this.testCycle.id, executionRequestDto);
        }
    }

    private async uploadEvidencesToQMetry(): Promise<void> {
        const failedOrFlakyTestCases: LinkedTestCase[] = this.getFailedAndFlakyCases();

        for (const testCase of failedOrFlakyTestCases) {
            const attachments = this.getAttachments(testCase);
            for (const attachment of attachments) {
                if (await this.isFileReadable(attachment.path)){
                    await this.uploadAttachmentToQMetry(testCase, attachment);
                }
            }
        }
    }

    private getFailedAndFlakyCases(): LinkedTestCase[] {
        return  this.testCaseStorage.filter(
            linkedTestCase => linkedTestCase.status === ExecutionResults.FAILED || linkedTestCase.status === ExecutionResults.FLAKY
        );
    }

    private getAttachments(testCase: LinkedTestCase): AttachmentDto[] {
        return testCase.attachments.filter(
            attachment => attachment.name === AttachmentType.TRACE || attachment.name === AttachmentType.SCREENSHOT
        );
    }

    private async isFileReadable(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
            return true;
        } catch (err) {
            console.log(`${filePath} is not readable or does not exist!`);
            return false;
        }
    }

    private async uploadAttachmentToQMetry(testCase: LinkedTestCase, attachment: AttachmentDto): Promise<void> {
        const retry: string = this.getRetryPrefix(attachment.path);
        let testIdentifier: string;
        retry ? testIdentifier = testCase.key + '_' + retry : testIdentifier = testCase.key;
        const fileName: string = testIdentifier + '_' + this.getFileName(attachment.path);
        const uploadPolicy: AttachmentUploadPolicyResponseDto = await this.qMetryInterface.getAttachmentUploadPolicy(this.testCycle.id, testCase.testCaseExecutionId, fileName);
        try {
            const uploadResponse: AxiosResponse = await this.qtm4JAwsInterface.upload(uploadPolicy.params, attachment.path);
            //console.debug('File upload response: ' + uploadResponse.status);
            try {
                await new Promise(resolve => setTimeout(resolve, 3*1000));
                const isFileUploaded: boolean = await this.isFileUploaded(testCase.testCaseExecutionId, fileName);
                if (uploadResponse.status !== 201 && !isFileUploaded) {
                    console.error(`File ${fileName} was not uploaded to QMetry`);
                    await this.uploadAttachmentToQMetry(testCase, attachment);
                }
            } catch (error) {
                console.error(`Error checking if file is uploaded: ${error}`);
            }
        } catch (error) {
            console.error(`Error uploading file: ${error}`);
        }
    }

    private async isFileUploaded(testcaseExecutionId: number, fileName: string): Promise<boolean> {
        let isFileUploaded: boolean = false;
        try {
            const attachments: GetAttachmentResponseDto = await this.qMetryInterface.getAttachmentsOfTestCase(this.testCycle.id, testcaseExecutionId);
            const uploadedFile: AttachmentData = attachments.data && attachments.data.find(attachmentData => attachmentData.name === fileName);
            if (uploadedFile) {
                console.log(`${fileName} file was uploaded to QMetry`);
                isFileUploaded = true;
            }
        } catch (error) {
            console.error(`Error checking if file is uploaded: ${error}`);
        }
        return isFileUploaded;
    }

    private getRetryPrefix(filePath: string): string | null {
        const matches: RegExpMatchArray = filePath.match(/retry\d+/);
        return matches ? matches[0] : null;
    }

    private getFileName(fullPath: string): string {
        const regExp: RegExp = /^.*[\\\/]/;
        return fullPath.replace(regExp, '');
    }

    private async closeTestCycle(): Promise<AxiosResponse> {
        const updateTestCycleRequestDto: UpdateTestCycleRequestDto = {
            status: TestCycleStatus.DONE,
        };
        return await this.qMetryInterface.updateTestCycle(this.testCycle.id, updateTestCycleRequestDto);
    }
}