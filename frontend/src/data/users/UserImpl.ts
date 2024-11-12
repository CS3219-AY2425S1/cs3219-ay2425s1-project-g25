import { IUser, IUserRegisterInput, IUserUpdateInput } from "domain/users/IUser";
import { mockUser } from "./mockUser";
import { userRemoteDataSource } from "./UserRemoteDataSource";

const USE_MOCK_API = false;
export class UserImpl implements IUser {
    private dataSource = USE_MOCK_API ? mockUser : userRemoteDataSource;

    async registerUser(user: IUserRegisterInput): Promise<any> {
        return this.dataSource.registerUser(user);
    }

    async loginUser(user: IUserRegisterInput): Promise<any> {
        return this.dataSource.loginUser(user);
    }

    async logoutUser(userId: string): Promise<any> {
        return this.dataSource.logoutUser(userId);
    }

    async updateUser(userId: string, userUpdateInput: IUserUpdateInput): Promise<any> {
        return this.dataSource.updateUser(userId, userUpdateInput);
    }

    async refreshToken(): Promise<any> {
        return this.dataSource.refreshToken();
    }

    async verifyToken(): Promise<any> {
        return this.dataSource.verifyToken();
    }

    async getUser(userId: string): Promise<any> {
        return this.dataSource.getUser(userId);
    }

    async getAllUsers(): Promise<any> {
        return this.dataSource.getAllUsers();
    }

    async deleteUser(userId: string): Promise<any> {
        return this.dataSource.deleteUser(userId);
    }

    async updateUserPrivilege(userId: string, isAdmin: boolean): Promise<any> {
        return this.dataSource.updateUserPrivilege(userId, isAdmin);
    }
    async forgetPassword(email: string): Promise<any> {
        return this.dataSource.forgetPassword(email);
    }

    async resetPassword(password: string, token: string) {
        return this.dataSource.resetPassword(password, token);
    }
}

export const userImpl = new UserImpl();
