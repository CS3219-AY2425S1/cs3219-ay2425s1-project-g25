import React from "react";
import styles from "./FindPeerButton.module.css";

interface FindPeerButtonProps {
    onClick: () => void;
}

export const FindPeerButton: React.FC<FindPeerButtonProps> = ({ onClick }) => {
    return (
        <button className={styles.findPeerButton} onClick={onClick}>
            <span>Let's go!</span>
        </button>
    );
};
