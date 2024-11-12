import AuthClientStore from "data/auth/AuthClientStore";
import { User } from "domain/entities/User";
import { IUserRegisterInput, IUserLoginInput, IUserUpdateInput } from "domain/users/IUser";

let users: User[] = [
    {
        _id: "1",
        username: "SampleUserName",
        email: "sample@gmail.com",
        isAdmin: false,
        createdAt: new Date()
    }
];

const MOCK_TOKEN = "TOKEN";

export class MockUser {
    private users: User[] = users;

    /**
     * Crates a new user.
     * @param user - the user to be created
     * @returns Promise resolving with the status and created user.
     */
    async registerUser(user: IUserRegisterInput): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const foundEmail = this.users.find((u) => u.email === user.email);
                const foundUsername = this.users.find((u) => u.username === user.username);
                if (foundEmail || foundUsername) {
                    resolve({
                        message: "Duplicate username or email encountered"
                    });
                } else {
                    const userId = (this.users.length + 1).toString();
                    const newUser: User = {
                        _id: userId,
                        username: user.username,
                        email: user.email,
                        isAdmin: false,
                        createdAt: new Date()
                    };
                    this.users.push(newUser);

                    resolve({
                        message: `Created new user ${user.username} successfully`,
                        data: newUser
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Logs in a user, creating an access token. No password checking.
     * @param user - the user to be logged in
     * @returns Promise resolving with the status and logged in user.
     */
    async loginUser(user: IUserLoginInput) {
        return new Promise((resolve, reject) => {
            try {
                const foundUser = this.users.find((u) => u.email === user.email);
                if (!foundUser) {
                    resolve({
                        message: "Wrong email and/or password"
                    });
                } else {
                    foundUser.accessToken = MOCK_TOKEN;
                    resolve({
                        message: "User logged in",
                        data: foundUser
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async logoutUser(userId: string) {
        return new Promise((resolve, reject) => {
            try {
                const foundUser = this.users.find((u) => u._id === userId);
                AuthClientStore.removeAccessToken();
                if (!foundUser) {
                    resolve({ message: "User is not logged in" });
                } else {
                    resolve({
                        message: "User logged out"
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async updateUser(userId: string, userUpdateInput: IUserUpdateInput) {
        return new Promise((resolve, reject) => {
            try {
                const foundUser = this.users.find((u) => u._id === userId);
                if (!foundUser) {
                    resolve({ message: "User not found" });
                    return;
                }
                const { email, username } = userUpdateInput;
                const foundEmail = this.users.find((u) => u.email === email && u._id !== userId);
                const foundUsername = this.users.find((u) => u.username === username && u._id !== userId);
                if (foundEmail || foundUsername) {
                    resolve({
                        message: "Duplicate username or email encountered"
                    });
                    return;
                }

                foundUser.email = userUpdateInput.email ?? foundUser.email;
                foundUser.username = userUpdateInput.username ?? foundUser.username;
                resolve({
                    message: "User updated",
                    data: foundUser
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async refreshToken() {
        return { accessToken: MOCK_TOKEN };
    }

    async verifyToken() {
        return new Promise((resolve, reject) => {
            try {
                resolve({ message: "Token verified", data: users[0] });
            } catch (error) {
                reject(error);
            }
        });
    }

    async getUser(userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const foundUser = this.users.find((u) => u._id === userId);
                if (!foundUser) {
                    resolve({ message: "User not found" });
                } else {
                    resolve({ message: "User found", data: foundUser });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async getAllUsers(): Promise<any> {
        return new Promise((resolve, reject) => ({ message: "Fetched all users", data: resolve(users) }));
    }

    async deleteUser(userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            users = users.filter((user) => user._id !== userId);
        });
    }

    async updateUserPrivilege(userId: string, isAdmin: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const foundUser = this.users.find((u) => u._id === userId);
                if (!foundUser) {
                    resolve({ message: "User not found" });
                } else {
                    foundUser.isAdmin = isAdmin;
                    resolve({ message: "User privileges updated", data: foundUser });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    async forgetPassword(email: string): Promise<any> {}

    async resetPassword(password: string, token: string): Promise<any> {}
}

export const mockUser = new MockUser();
