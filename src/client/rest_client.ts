import { environment } from "../config/environment";

import axios, {AxiosInstance, InternalAxiosRequestConfig, AxiosResponse} from "axios";
import * as winston from "winston";

export class RestClient {
    protected client: AxiosInstance;
    private logger: winston.Logger;

    constructor(baseUrl: string, headers: Record<string, string>) {
        this.logger = winston.createLogger({
            level: environment.env.loglevel,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
            transports: [
                new winston.transports.Console(),
            ],
        });

        this.client = axios.create({
            baseURL: baseUrl,
            headers: headers,
            timeout: environment.REQUEST_TIMEOUT,
            proxy: false,
        });

        this.setupRequestInterceptor();
        this.setupResponseInterceptor();
    }

    private setupRequestInterceptor(): void {
        this.client.interceptors.request.use(
            (request: InternalAxiosRequestConfig) => {
                this.logger.debug(`Request url: ${request.method?.toUpperCase()} - ${request.baseURL}${request.url}`);
                this.logger.debug(`Request headers: ${JSON.stringify(request.headers, null, 2)}`);
                this.logger.debug(`Request data: ${JSON.stringify(request.data, null, 4)}`);
                return request;
            },
            (error) => {
                this.logger.error(`${error.request.method} : ${error.request.url}`);
                this.logger.error(`${JSON.stringify(error.request.headers)}`);
                this.logger.error(`${JSON.stringify(error.request.data)}`);
                return Promise.reject(error);
            }
        );
    }

    private setupResponseInterceptor(): void {
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                this.logger.debug(`Response status: ${response.status}`);
                this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 4)}`);
                return response;
            },
            (error) => {
                this.logger.error(`${error.response.status} : ${error.response.data.errorMessage}`);
                return Promise.reject(error);
            }
        );
    }

}