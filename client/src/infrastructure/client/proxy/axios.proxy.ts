import axios, {Axios, AxiosError} from "axios";
import {ClientErrorResponse, ClientResponse} from "../response";
import {ProxyClient} from "./proxy";

interface ErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
}

const handleError = (error?: AxiosError | unknown): ClientErrorResponse => {
    let axiosError!: AxiosError;
    if (error && (axiosError = error as AxiosError) != null && axiosError.response) {
        const { data, status, statusText } = axiosError.response;
        const { error, message } = data as ErrorResponse;
        return {
            type: 'ERROR',
            status,
            statusText,
            error,
            errorMessage: message,
        };
    }

    return {
        type: 'ERROR',
        errorMessage: 'Undefined error',
        status: -1,
        error: '',
        statusText: '',
    };
};

export class AxiosProxy implements ProxyClient {
    client!: Axios;

    constructor(baseUrl: string, jwtToken: string) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
    }

    async post<T, K>(url:string, content:T): Promise<ClientResponse<K>> {
        try {
            const { data, status, statusText } = await  this.client.post(url, content);
            return {
                type: 'SUCCESS',
                result: data,
                status,
                statusText,
            };
        } catch (e: unknown) {
            return handleError(e);
        }
    }

    async get<T>(url: string): Promise<ClientResponse<T>> {
        try {
            const { data, status, statusText } = await  this.client.get(url);
            return {
                type: 'SUCCESS',
                result: data,
                status,
                statusText,
            };
        } catch (e: unknown) {
            return handleError(e);
        }
    }

    async put<T, K>(url: string, content: T): Promise<ClientResponse<K>> {
        try {
            const { data, status, statusText } = await this.client.put(url, content);
            return {
                type: 'SUCCESS',
                result: data,
                status,
                statusText,
            };
        } catch (e: unknown) {
            return handleError(e);
        }
    }

    async patch<T, K>(url: string, content: T): Promise<ClientResponse<K>> {
        try {
            const { data, status, statusText } = await this.client.patch(url, content);
            return {
                type: 'SUCCESS',
                result: data,
                status,
                statusText,
            };
        } catch (e: unknown) {
            return handleError(e);
        }
    }

    async del<T = undefined>(url: string): Promise<ClientResponse<T>> {
        try {
            const { data, status, statusText } = await this.client.delete(url);
            return {
                type: 'SUCCESS',
                result: data,
                status,
                statusText,
            };
        } catch (e: unknown) {
            return handleError(e);
        }
    }
}
