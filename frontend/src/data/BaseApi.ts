import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import API_URL from "../config";
import { userUseCases } from "domain/usecases/UserUseCases";
import AuthClientStore from "./auth/AuthClientStore";

export class BaseApi {
    private axiosInstance: AxiosInstance;
    private protectedAxiosInstance: AxiosInstance;
    private protectedRequestInterceptorId: number;
    private protectedResponseInterceptorId: number;

    constructor(baseUrl: string) {
        this.axiosInstance = this.createAxiosInstance(baseUrl);
        this.protectedAxiosInstance = this.createAxiosInstance(baseUrl);
        this.protectedRequestInterceptorId = this.setUpRequestInterceptors(this.protectedAxiosInstance);
        this.protectedResponseInterceptorId = this.setUpResponseInterceptors(this.protectedAxiosInstance);
    }

    private createAxiosInstance(baseUrl: string): AxiosInstance {
        return axios.create({
            baseURL: API_URL + baseUrl,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });
    }

    private setUpRequestInterceptors(axiosInstance: AxiosInstance): number {
        return axiosInstance.interceptors.request.use(
            (req: InternalAxiosRequestConfig) => {
                if (!req.headers["Authorization"]) {
                    const accessToken = AuthClientStore.getAccessToken();
                    req.headers["Authorization"] = `Bearer ${accessToken}`;
                }
                return req;
            },
            (err: AxiosError) => Promise.reject(err)
        );
    }

    private setUpResponseInterceptors(axiosInstance: AxiosInstance): number {
        return axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (err: AxiosError) => {
                const prevRequest = err?.config;
                if (prevRequest && err?.response?.status === 401) {
                    try {
                        // Eject to prevent infinite loop
                        this.protectedAxiosInstance.interceptors.response.eject(this.protectedResponseInterceptorId);
                        const newAccessToken = await userUseCases.refreshToken();
                        prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                        AuthClientStore.setAccessToken(newAccessToken);
                        return this.protectedAxiosInstance(prevRequest);
                    } catch (error) {
                        // Refresh token expired/invalid
                        console.error(error);
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(err);
            }
        );
    }

    protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }

    protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.put<T>(url, data, config);
        return response.data;
    }

    protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.patch<T>(url, data, config);
        return response.data;
    }

    protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.delete<T>(url, config);
        return response.data;
    }
    protected async protectedGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.get<T>(url, config);
        return response.data;
    }

    protected async protectedPost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.post<T>(url, data, config);
        return response.data;
    }

    protected async protectedPut<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.put<T>(url, data, config);
        return response.data;
    }

    protected async protectedPatch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.patch<T>(url, data, config);
        return response.data;
    }

    protected async protectedDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.delete<T>(url, config);
        return response.data;
    }
}
