// ToggleButton.tsx
import React from "react";
import styles from "./ToggleButton.module.css";

const ToggleButton = ({ showChat, onClick }: { showChat: boolean; onClick: () => void }) => {
    return (
        <div className={styles.toggleContainer}>
            <button className={styles.toggleButton} onClick={onClick}>
                <span className={styles.iconWrapper}>
                    {showChat ? (
                        <span className={`${styles.icon} ${styles.bookIcon}`}>📖</span>
                    ) : (
                        <span className={`${styles.icon} ${styles.chatIcon}`}>💬</span>
                    )}
                </span>
                <span>{showChat ? "View Question" : "Open Chat"}</span>
            </button>
            <div className={`${styles.status} ${showChat ? styles.chatMode : styles.questionMode}`}>
                {showChat ? "Chat Mode" : "Question Mode"}
            </div>
        </div>
    );
};

export default ToggleButton;
