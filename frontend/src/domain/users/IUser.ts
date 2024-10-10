export interface IUserRegisterInput {
    username: string;
    email: string;
    password: string;
}

export interface IUserLoginInput {
    email: string,
    password: string,
}


export interface IUser {
    registerUser(user: IUserRegisterInput): Promise<any>;
    loginUser(user: IUserLoginInput): Promise<any>;
}