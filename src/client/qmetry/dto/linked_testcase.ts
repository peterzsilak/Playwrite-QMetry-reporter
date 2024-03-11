import {AttachmentDto} from "./attachment_dto";

export interface LinkedTestCase {
    testCycleTestCaseMapId?: number,
    id?: string,
    key?: string
    testCaseExecutionId?: number
    versionNo?: number,
    priority?: Priority,
    status?: Status,
    projectId?: number,
    archived?: boolean,
    attachments?: Array<AttachmentDto>
}

export interface Priority {
}

export interface Status {
}
