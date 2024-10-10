const ACCESS_TOKEN_KEY = "accessToken";

class AuthClientStore {
    static getAccessToken() {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!accessToken) {
            throw new Error("No access token");
        }
        return accessToken;
    }
    static setAccessToken(token: string) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    static removeAccessToken(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    static containsAccessToken() {
        return localStorage.hasOwnProperty(ACCESS_TOKEN_KEY);
    }
}

export default AuthClientStore;
