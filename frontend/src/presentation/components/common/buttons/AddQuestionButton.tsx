import React from 'react';
import styles from './AddQuestionButton.module.css';

interface AddQuestionButtonProps {
    label: string;
    onClick: () => void;
}

export const AddQuestionButton: React.FC<AddQuestionButtonProps> = ({ label, onClick }) => (
    <button className={styles.customButton} onClick={onClick}>
        <span>{label}</span>
    </button>
);
