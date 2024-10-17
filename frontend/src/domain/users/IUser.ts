import { User } from "domain/entities/User";

export interface IUserRegisterInput {
    username: string;
    email: string;
    password: string;
}

export interface IUserLoginInput {
    email: string;
    password: string;
}

export interface IUserUpdateInput {
    email?: string;
    username?: string;
    password?: string;
}

export interface IUser {
    verifyToken(): any;
    refreshToken(): Promise<any>;
    registerUser(user: IUserRegisterInput): Promise<any>;
    loginUser(user: IUserLoginInput): Promise<any>;
    logoutUser(userId: string): Promise<any>;
    updateUser(userId: string, userUpdateInput: IUserUpdateInput): Promise<any>;
}
