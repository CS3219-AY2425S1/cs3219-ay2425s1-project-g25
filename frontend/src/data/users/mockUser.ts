import { User } from "domain/entities/User";
import { IUserRegisterInput, IUserLoginInput } from "domain/users/IUser";

const users: User[] = [
    {
        _id: "1",
        username: "SampleUserName",
        email: "sample@gmail.com",
        isAdmin: false,
        createdAt: new Date()
    }
];

export class MockUser {
    private users: User[] = users;

    /**
     * Crates a new user.
     * @param user - the user to be created
     * @returns Promise resolving with the status and created user.
     */
    async registerUser(user: IUserRegisterInput): Promise<{ status: number; data: any }> {
        return new Promise((resolve, reject) => {
            try {
                console.log(this.users)
                const foundEmail = this.users.find((u) => u.email === user.email);
                const foundUsername = this.users.find((u) => u.username === user.username);
                if (foundEmail || foundUsername) {
                    resolve({
                        status: 409,
                        data: {
                            message: "Duplicate username or email encountered"
                        }
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
                        status: 201,
                        data: {
                            message: `Created new user ${user.username} successfully`,
                            data: newUser
                        }
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
                console.log(this.users)
                const foundUser = this.users.find((u) => u.email === user.email);
                if (!foundUser) {
                    resolve({
                        status: 401,
                        data: {
                            message: "Wrong email and/or password"
                        }
                    });
                } else {
                    foundUser.accessToken = user.email + "TOKEN";
                    resolve({
                        status: 200,
                        data: {
                            message: "User logged in",
                            data: foundUser
                        }
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

export const mockUser = new MockUser();