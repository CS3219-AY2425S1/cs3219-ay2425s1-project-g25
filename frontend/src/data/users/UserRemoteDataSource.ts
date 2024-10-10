import { BaseApi } from "data/BaseApi";
import { IUserLoginInput, IUserRegisterInput } from "domain/users/IUser";

const API_URL = "";

export class UserRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    /**
     * Registers a new user.
     * @param user - The input data for the new user.
     * @returns Promise resolving with the created user.
     */
    async registerUser(user: IUserRegisterInput) {
        const payload = {
            ...user
        };
        return await this.post<any>("/users/", payload);
    }

    /**
     * Logs in a user.
     * @param user - The input data for the user.
     * @returns Promise resolving with the logged in user.
     */
    async loginUser(user: IUserLoginInput) {
        const payload = {
            ...user
        };
        return await this.post<any>("/auth/login", payload);
    }

    async logoutUser(userId: string) {
        return await this.protectedPost<any>("/auth/logout", { userId });
    }

    async refreshToken() {
        return await this.protectedGet<any>("/auth/refresh");
    }

    async verifyToken() {
        return await this.protectedGet<any>("/auth/verify-token");
    }
}

export const userRemoteDataSource = new UserRemoteDataSource();
