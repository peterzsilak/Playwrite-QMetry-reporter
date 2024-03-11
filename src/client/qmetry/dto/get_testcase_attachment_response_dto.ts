export interface GetAttachmentResponseDto {
    startAt: number
    maxResults: number
    total: number
    data: AttachmentData[]
}

export interface AttachmentData {
    id: number
    name: string
    size: number
    url: string
    stepSeqNo: StepSeqNo
    stepExecutionSeqNo: StepExecutionSeqNo
    created: Created
    level: string
}

export interface StepSeqNo {}

export interface StepExecutionSeqNo {}

export interface Created {
    createdOn: string
    createdBy: string
}