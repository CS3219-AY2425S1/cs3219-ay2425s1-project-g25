import { IUser, IUserRegisterInput } from "domain/users/IUser";
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
}

export const userImpl = new UserImpl();