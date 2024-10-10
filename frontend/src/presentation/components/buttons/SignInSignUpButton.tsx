import React from "react";
import styles from "./SignInSignUpButton.module.css";
import { useLocation, useNavigate } from "react-router-dom";

export const SignInSignUpButton: React.FC = () => {
    const location = useLocation();
    const isRegister = location.pathname.includes("register");
    const buttonText = isRegister ? "Sign In" : "Sign Up";
    const navigate = useNavigate();

    const navigateTo = () => {
        if (isRegister) {
            navigate("/login")
        } else if (location.pathname.includes("login")) {
            navigate("/register")
        } else {
            console.error("Invalid page to use SignInSignUpButton");
        }
    }

    return (
        <button className={styles.customButton} onClick={navigateTo}>
            <span>{buttonText}</span>
        </button>
    );
};
