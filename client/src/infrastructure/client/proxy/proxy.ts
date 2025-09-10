import {ClientResponse} from "../response";

export interface ProxyClient {
    post<T, K>(url: string, model: T): Promise<ClientResponse<K>>;

    get<T>(url: string): Promise<ClientResponse<T>>;

    put<T, K>(url: string, model: T): Promise<ClientResponse<K>>;

    patch<T, K>(url: string, model: T): Promise<ClientResponse<K>>;

    del<T = undefined>(url: string): Promise<ClientResponse<T>>;
}
