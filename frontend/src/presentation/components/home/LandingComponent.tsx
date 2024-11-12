import React from "react";
import { Card } from "antd";
import styles from "./LandingComponent.module.css";
import { AddQuestionButton } from "../common/buttons/AddQuestionButton";
import { LANDING_CARD_TEXT } from "presentation/utils/constants";
import { UserCard } from "../common/cards/UserCard";

interface LandingComponentProps {
    onAddQuestion?: () => void;
    isAdmin: boolean;
    matchUserId?: string;
}

export const LandingComponent: React.FC<LandingComponentProps> = ({ onAddQuestion, isAdmin, matchUserId }) => (
    <div className={styles.cardWrapper}>
        <Card className={styles.card}>
            <div className={styles.content}>
                <h2>{isAdmin ? LANDING_CARD_TEXT.ADMIN_WELCOME : LANDING_CARD_TEXT.PEER_WELCOME}</h2>
                <p>{isAdmin ? LANDING_CARD_TEXT.ADMIN_INSTRUCTIONS : LANDING_CARD_TEXT.PEER_INSTRUCTIONS}</p>
                {isAdmin && onAddQuestion && (
                    <AddQuestionButton label={LANDING_CARD_TEXT.ADD_QUESTION} onClick={onAddQuestion} />
                )}
            </div>
            {matchUserId && (
                <div className={styles.userCardWrapper}>
                    <UserCard userId={matchUserId} />
                </div>
            )}
        </Card>
    </div>
);
