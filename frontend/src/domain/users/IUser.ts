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
    getUser(userId: string): Promise<any>;
    getAllUsers(): Promise<any>;
    deleteUser(userId: string): Promise<any>;
    updateUserPrivilege(userId: string, isAdmin: boolean): Promise<any>;
    forgetPassword(email: string): Promise<any>;
    resetPassword(password: string, token: string): Promise<any>;
}
