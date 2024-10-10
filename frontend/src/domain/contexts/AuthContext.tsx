import { User } from "domain/entities/User";
import { userUseCases } from "domain/usecases/UserUseCases";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AuthClientStore from "data/auth/AuthClientStore";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean | undefined;
    isUserAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const verifyAccessToken = async () => {
            try {
                const user = await userUseCases.verifyToken();
                setUser(user);
                setIsLoggedIn(true);
            } catch (err) {
                // Refresh token missing or invalid
                console.error(err);
                setUser(null);
                setIsLoggedIn(false);
            }
        };

        if (!AuthClientStore.containsAccessToken()) {
            setIsLoggedIn(false);
            setUser(null);
            return;
        }
        verifyAccessToken();
    }, []);

    const login = async (email: string, password: string) => {
        const userAndAccessToken = await userUseCases.loginUser(email, password);
        const user = userAndAccessToken.user;
        const accessToken = userAndAccessToken.accessToken;
        setUser(user);
        setIsLoggedIn(true);
        AuthClientStore.setAccessToken(accessToken);
    };

    const logout = async () => {
        if (!user) {
            return;
        }
        await userUseCases.logoutUser(user?._id);
        AuthClientStore.removeAccessToken();
        setUser(null);
        setIsLoggedIn(false);
    };

    const register = async (email: string, password: string, username: string): Promise<User> => {
        const userData = await userUseCases.registerUser(username, email, password);
        return userData;
    };

    const isUserAdmin = isLoggedIn === true && user != null && user.isAdmin;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isUserAdmin, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
};
