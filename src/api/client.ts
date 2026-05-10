import axios, { AxiosError, type AxiosInstance } from 'axios';

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

class ApiClient {
    // hide instance behind a private, reveal only via getClient
    private instance: AxiosInstance;

    constructor() {
        const baseUrl = import.meta.env.VITE_API_URL ?? 'localhost:8521';

        this.instance = axios.create({
            baseURL: baseUrl,
            timeout: 5000,
        });

        // one for req
        this.instance.interceptors.request.use(
            (config) => {
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // one for res
        this.instance.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                console.error(error);
                throw new ApiError(error.message, error.response?.status, error.response?.data);
            }
        );
    }

    public getClient(): AxiosInstance {
        return this.instance;
    }
}

export const apiClient = new ApiClient().getClient();
