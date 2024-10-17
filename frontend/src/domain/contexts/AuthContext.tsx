import { User } from "domain/entities/User";
import { userUseCases } from "domain/usecases/UserUseCases";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import AuthClientStore from "data/auth/AuthClientStore";
import { IUserUpdateInput } from "domain/users/IUser";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean | undefined;
    isUserAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    updateUser: (userUpdateInput: IUserUpdateInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
    const isMounted = useRef<boolean>(false);
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

        if (!isMounted.current) {
            verifyAccessToken();
        }
        isMounted.current = true;
    }, []);

    const login = async (email: string, password: string) => {
        const userAndAccessToken = await userUseCases.loginUser(email, password);
        const user = userAndAccessToken.user;
        const accessToken = userAndAccessToken.accessToken;
        handleSuccessfulAuth(accessToken, user);
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

    const register = async (email: string, password: string, username: string) => {
        const userAndAccessToken = await userUseCases.registerUser(username, email, password);
        const user = userAndAccessToken.user;
        const accessToken = userAndAccessToken.accessToken;
        handleSuccessfulAuth(accessToken, user);
    };

    const updateUser = async (userUpdateInput: IUserUpdateInput) => {
        if (user) {
            const updatedUser = await userUseCases.updateUser(user?._id, userUpdateInput);
            setUser(updatedUser);
        }
    };

    const handleSuccessfulAuth = (accessToken: string, user: User) => {
        setUser(user);
        setIsLoggedIn(true);
        AuthClientStore.setAccessToken(accessToken);
    };

    const isUserAdmin = isLoggedIn === true && user != null && user.isAdmin;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isUserAdmin, login, logout, register, updateUser }}>
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
