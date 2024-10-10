import { userImpl } from "data/users/UserImpl";
import { User } from "domain/entities/User";
import { IUser, IUserRegisterInput, IUserLoginInput } from "domain/users/IUser";
import { AuthenticationError } from "presentation/utils/errors";

export class UserUseCases {
    constructor(private user: IUser) { }

    /**
     * Registers a new user.
     * @param username - the username of the user.
     * @param email - the email of the user.
     * @param password - the password of the user.
     * @returns Promise resolving with the created user.
     * @throws DuplicateUserError if the email or username is already registered.
     */
    async registerUser(username: string, email: string, password: string): Promise<User> {
        const userInput: IUserRegisterInput = {
            username,
            email,
            password
        };
        const data =  await this.user.registerUser(userInput);
        if (!data.data) {
            throw new AuthenticationError(data.message);
        }
        return data.data;
    }

    /**
     * Authenticates and logs a user in.
     * @param email - the email of the user.
     * @param password - the password of the user.
     * @returns Promise resolving with the authenticated user.
     * @throws AuthenticationError if the email or password is incorrect.
     */
    async loginUser(email: string, password: string): Promise<User> {
        const userInput: IUserLoginInput = {
            email,
            password
        };
        const data = await this.user.loginUser(userInput);
        if (!data.data) {
            throw new AuthenticationError(data.message);
        }
        return data.data;
    }
}

export const userUseCases = new UserUseCases(userImpl);