import React, { useEffect, useState } from "react";
import styles from "./LoginForm.module.css";
import { userUseCases } from "domain/usecases/UserUseCases";
import { useNavigate } from "react-router-dom";
import { handleError } from "presentation/utils/errorHandler";
import { useUser } from "domain/contexts/userContext";

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    // Only navigate to home after user is set
    useEffect(() => {
        if (user && user.username) {
            navigate("/home");
        }
    }, [user, navigate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const userData = await userUseCases.loginUser(email, password);
            setUser(userData);
        } catch (error) {
            console.error("Failed to log in user", error);
            alert(handleError(error, "Failed to log in user"));
        }
    };

    return (
        <div className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.title}>Sign In</h2>
                    <label className={styles.label}>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="Email"
                            required
                        />
                    </label>
                    <label className={styles.label}>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="Password"
                            required
                        />
                    </label>
                    <button type="submit" className={styles.button}>
                        Sign In
                    </button>
                </form>
        </div>
    );
};
