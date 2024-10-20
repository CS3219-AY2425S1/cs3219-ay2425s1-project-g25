import { userImpl } from "data/users/UserImpl";
import { User } from "domain/entities/User";
import { IUser, IUserRegisterInput, IUserLoginInput, IUserUpdateInput } from "domain/users/IUser";
import { UserValidator } from "domain/validation/UserValidator";
import { AuthenticationError } from "presentation/utils/errors";

export class UserUseCases {
    constructor(private user: IUser) {}

    /**
     * Registers a new user.
     * @param username - the username of the user.
     * @param email - the email of the user.
     * @param password - the password of the user.
     * @returns Promise resolving with the access token and authenticated user.
     * @throws DuplicateUserError if the email or username is already registered.
     */
    async registerUser(
        username: string,
        email: string,
        password: string
    ): Promise<{ accessToken: string; user: User }> {
        const userInput: IUserRegisterInput = {
            username,
            email,
            password
        };
        const data = await this.user.registerUser(userInput);
        if (!data.data) {
            throw new AuthenticationError(data.message);
        }
        return data.data;
    }

    /**
     * Authenticates and logs a user in.
     * @param email - the email of the user.
     * @param password - the password of the user.
     * @returns Promise resolving with the access token and authenticated user.
     * @throws AuthenticationError if the email or password is incorrect.
     */
    async loginUser(email: string, password: string): Promise<{ accessToken: string; user: User }> {
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

    /**
     * Logs the user out by invalidating their session.
     * @param userId - The ID of the user to log out.
     * @returns Promise that resolves when the logout is successful.
     */
    async logoutUser(userId: string): Promise<void> {
        return await this.user.logoutUser(userId);
    }

    /**
     * Updates the user's credentials.
     * @param userUpdateInput - The updated user's credentials.
     * @returns Promise that resolves to an updated user.
     */
    async updateUser(userId: string, userUpdateInput: IUserUpdateInput): Promise<User> {
        UserValidator.validateUserUpdateInput(userUpdateInput);
        const data = await this.user.updateUser(userId, userUpdateInput);
        if (!data.data) {
            throw new AuthenticationError(data.message);
        }
        return data.data;
    }

    /**
     * Refreshes the user's access token
     * @returns Promise resolving with the new access token
     * @throws AuthenticationError if access token cannot be refreshed (refresh token is invalid or expired)
     */
    async refreshToken(): Promise<any> {
        const data = await this.user.refreshToken();
        if (!data.data) {
            throw new AuthenticationError(data.message);
        }
        return data.data;
    }

    /**
     * Verifies the validity of the user's access token
     * @returns Promise resolving with the authenticated user
     * @throws AuthenticationError if access token is invalid or expires
     */
    async verifyToken(): Promise<User> {
        const data = await this.user.verifyToken();
        if (!data.data) {
            throw new AuthenticationError(data.message);
        }
        return data.data;
    }

    /**
    * Retrieves a user by their ID.
    * @param userId - The ID of the user to retrieve.
    * @returns Promise resolving with the retrieved user.
    * @throws AuthenticationError if the user cannot be found or access is denied.
    */
    async getUser(userId: string): Promise<User> {
        const data = await this.user.getUser(userId);
        if (!data) {
            throw new AuthenticationError("User not found or access denied");
        }
        return data.data;
    }

}

export const userUseCases = new UserUseCases(userImpl);
