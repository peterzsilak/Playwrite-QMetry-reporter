import { environment } from "../../config/environment";

import { AxiosResponse } from "axios";
import { QTM4JAwsInterface } from "./qtm4j_aws_interface";
import { RestClient } from "../rest_client";

// @ts-ignore
import FormData from 'form-data';
import * as fs from 'fs';

export class QTM4JAwsClient extends RestClient implements QTM4JAwsInterface {
    constructor() {
        super(environment.qtm4j.aws.baseurl, {});
    }

    public async upload(params: Record<string, any>, filePath: string): Promise<AxiosResponse> {
        const formData = new FormData();

        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value);
        });

        formData.append('file', fs.createReadStream(filePath));

        try {
            const response = await this.client.post('', formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            return response;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
}
