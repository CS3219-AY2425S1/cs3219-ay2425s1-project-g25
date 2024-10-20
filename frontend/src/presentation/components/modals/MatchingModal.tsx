import React from "react";
import { Modal, Spin, Button } from "antd";
import { useMatchmaking } from "domain/context/MatchmakingContext";
import styles from "./MatchingModal.module.css";

interface MatchingModalProps {
    onRetry: () => void;
}

export const MatchingModal: React.FC<MatchingModalProps> = ({ onRetry }) => {
    const { state, cancelMatching, closeModal } = useMatchmaking();
    const { elapsedTime, status, isModalVisible, countdown } = state;

    const handleCancelFinding = () => {
        cancelMatching();
    };

    const handleRetry = () => {
        cancelMatching();

        onRetry();
    };

    const renderModalContent = () => {
        switch (status) {
            case "matching":
                return (
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
                );
            case "found":
                return (
                    <div className={styles.matchFoundSection}>
                        <h2>Match Found!</h2>
                        <p>Redirecting you in {countdown} seconds...</p>
                    </div>
                );
            case "failed":
                return (
                    <div className={styles.matchFailedSection}>
                        <h2>No Match Found</h2>
                        <p>Matching took too long, please try again.</p>
                        <Button type="primary" onClick={handleRetry}>
                            Retry
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            open={isModalVisible}
            footer={null}
            centered
            className={styles.matchingModal}
            width={800}
            mask={false}
            maskClosable={false}
            onCancel={closeModal}
        >
            <div className={styles.modalContent}>{renderModalContent()}</div>
        </Modal>
    );
};
