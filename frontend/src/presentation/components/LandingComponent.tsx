import React from "react";
import { Card } from "antd";
import styles from "./LandingComponent.module.css";
import { AddQuestionButton } from "./buttons/AddQuestionButton";
import { LANDING_CARD_TEXT } from "presentation/utils/constants";

interface LandingComponentProps {
    onAddQuestion: () => void;
}

export const LandingComponent: React.FC<LandingComponentProps> = ({ onAddQuestion }) => (
    <div className={styles.cardWrapper}>
        <Card className={styles.card}>
            <div className={styles.content}>
                <h2>{LANDING_CARD_TEXT.WELCOME}</h2>
                <p>{LANDING_CARD_TEXT.INSTRUCTIONS}</p>
                <AddQuestionButton label={LANDING_CARD_TEXT.ADD_QUESTION} onClick={onAddQuestion} />
            </div>
        </Card>
    </div>
);
