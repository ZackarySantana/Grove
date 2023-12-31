import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Either } from "../types";

export type ClientOptions = {
    baseURL: string;
    headers?: Record<string, string>;
};

export type ClientType = {
    get<T>(path: string): Promise<Either<T, Error>>;
    post<T>(path: string, data: unknown): Promise<Either<T, Error>>;
    put<T>(path: string, data: unknown): Promise<Either<T, Error>>;
    delete<T>(path: string): Promise<Either<T, Error>>;
    patch<T>(path: string, data: unknown): Promise<Either<T, Error>>;
};

export class Client implements ClientType {
    protected baseURL: string;
    protected headers: Record<string, string>;

    constructor(options: ClientOptions) {
        this.baseURL = options.baseURL;
        if (this.baseURL.endsWith("/")) {
            this.baseURL = this.baseURL.substring(0, this.baseURL.length - 1);
        }
        this.headers = options.headers || {};
    }

    private async makeRequest<T>(
        path: string,
        method: string,
        data?: unknown,
    ): Promise<Either<T, Error>> {
        const requestOptions: AxiosRequestConfig = {
            url: `${this.baseURL}${path}`,
            method,
            headers: {
                "Content-Type": "application/json",
                ...this.headers,
            },
            data: data ? JSON.stringify(data) : undefined,
        };

        try {
            const response = await axios.request<T>(requestOptions);
            return [response.data, undefined];
        } catch (err) {
            if (err instanceof AxiosError) {
                return [undefined, err.response?.data ?? err];
            }
            if (err instanceof Error) {
                return [undefined, err];
            }
            return [undefined, Error(String(err))];
        }
    }

    async get<T>(path: string, data?: unknown): Promise<Either<T, Error>> {
        return this.makeRequest<T>(path, "GET", data);
    }

    async post<T>(path: string, data: unknown): Promise<Either<T, Error>> {
        return this.makeRequest<T>(path, "POST", data);
    }

    async put<T>(path: string, data: unknown): Promise<Either<T, Error>> {
        return this.makeRequest<T>(path, "PUT", data);
    }

    async delete<T>(path: string): Promise<Either<T, Error>> {
        return this.makeRequest<T>(path, "DELETE");
    }

    async patch<T>(path: string, data: unknown): Promise<Either<T, Error>> {
        return this.makeRequest<T>(path, "PATCH", data);
    }
}

export function addHeaders(
    options: ClientOptions,
    headers: Record<string, string>,
): ClientOptions {
    if (options.headers === undefined) {
        options.headers = {};
    }
    for (const header in headers) {
        options.headers[header] = headers[header];
    }
    return options;
}
