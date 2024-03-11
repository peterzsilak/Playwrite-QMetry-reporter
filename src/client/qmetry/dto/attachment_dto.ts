export interface AttachmentDto {
    name: string;
    contentType: string;
    path?: string;
    body?: Buffer;
}
