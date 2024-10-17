export interface User {
    _id: string,
    username: string,
    email:string,
    isAdmin: boolean,
    createdAt: Date,
    accessToken?: string
}