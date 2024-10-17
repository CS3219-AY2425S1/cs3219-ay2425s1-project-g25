import React, { useEffect, useState, useCallback } from "react";
import { Modal, Spin, Button } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./MatchingModal.module.css";

interface MatchingModalProps {
    visible: boolean;
    onClose: () => void;
    // This flag is temporary for simulation purposes
    simulateFoundOrFail?: "found" | "failed";
}

export const MatchingModal: React.FC<MatchingModalProps> = ({ visible, onClose, simulateFoundOrFail }) => {
    const navigate = useNavigate();
    const [matchStatus, setMatchStatus] = useState<"matching" | "found" | "failed">("matching");
    const [elapsedTime, setElapsedTime] = useState(0);
    const [redirectTime, setRedirectTime] = useState(3);

    const handleMatchResult = useCallback(() => {
        if (simulateFoundOrFail) {
            setMatchStatus(simulateFoundOrFail);
        } else {
            setMatchStatus("failed");
        }
    }, [simulateFoundOrFail]);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        let countdownTimer: NodeJS.Timeout | undefined;

        if (matchStatus === "matching") {
            timer = setInterval(() => {
                setElapsedTime((prevTime) => {
                    const newTime = prevTime + 1;
                    if (newTime >= 30) {
                        handleMatchResult();
                    }
                    return newTime;
                });
            }, 1000);
        }

        if (matchStatus === "found") {
            countdownTimer = setInterval(() => {
                setRedirectTime((prevTime) => prevTime - 1 );
            }, 1000);

            const redirectTimeout = setTimeout(() => {
                onClose();
                navigate("/questions");
            }, 3000);

            return () => {
                clearTimeout(redirectTimeout);
                clearInterval(countdownTimer);
            };
        }

        return () => {
            if (timer) clearInterval(timer);
            if (countdownTimer) clearInterval(countdownTimer);
        };
    }, [matchStatus, navigate, onClose, handleMatchResult]);

    useEffect(() => {
        if (!visible) {
            setMatchStatus("matching");
            setElapsedTime(0);
            setRedirectTime(3);
        }
    }, [visible]);

    const handleRetry = useCallback(() => {
        setMatchStatus("matching");
        setElapsedTime(0);
    }, []);

    const handleCancelFinding = useCallback(() => {
        setElapsedTime(0);
        onClose();
    }, [onClose]);

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            className={styles.matchingModal}
            width={800}
            mask={false}
            maskClosable={false}
        >
            <div className={styles.modalContent}>
                {matchStatus === "matching" && (
                    <div className={styles.matchingSection}>
                        <Spin size="large" />
                        <p className={styles.matchingText}>Matching you with a peer...</p>
                        <p className={styles.elapsedTimeText}>
                            Time waiting: {elapsedTime >= 60 ? `${Math.floor(elapsedTime / 60)}m ` : ""}
                            {elapsedTime % 60}s
                        </p>
                        <Button type="primary" danger onClick={handleCancelFinding} className={styles.cancelButton}>
                            Cancel Finding
                        </Button>
                    </div>
                )}
                {matchStatus === "found" && (
                    <div className={styles.matchFoundSection}>
                        <h2>Match Found!</h2>
                        <p>
                            You are now matched with a peer! Redirecting in {redirectTime} second
                            {redirectTime !== 1 ? "s" : ""}...
                        </p>
                    </div>
                )}
                {matchStatus === "failed" && (
                    <div className={styles.matchFailedSection}>
                        <h2>No Match Found</h2>
                        <p>Matching took too long, please try again.</p>
                        <Button type="primary" onClick={handleRetry}>
                            Retry
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
