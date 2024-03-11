import { AxiosResponse } from "axios";

export interface QTM4JAwsInterface {

    upload( params: Object, filePath: string ): Promise<AxiosResponse>;

}