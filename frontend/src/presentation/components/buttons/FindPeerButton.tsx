import React from 'react';
import styles from './FindPeerButton.module.css';

export const FindPeerButton: React.FC = () => {
    return <button className={styles.customButton}>
        <span>Let's go!</span>
    </button>;
};
