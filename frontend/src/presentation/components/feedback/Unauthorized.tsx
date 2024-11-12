import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Unauthorized.module.css";

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate("/");
    };

    return (
        <div className={styles.unauthorizedContainer}>
            <h1 className={styles.unauthorizedTitle}>Unauthorized</h1>
            <p className={styles.unauthorizedMessage}>You do not have the necessary permissions to access this page.</p>
            <button className={styles.backButton} onClick={handleGoBack}>
                Go Back to Home
            </button>
        </div>
    );
};

export default Unauthorized;
