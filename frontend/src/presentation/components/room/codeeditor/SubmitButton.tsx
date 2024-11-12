import React, { useState } from "react";
import { Button, Modal, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import styles from "./CodeActionButtons.module.css";
import { historyUseCases } from "domain/usecases/HistoryUseCases";

interface SaveButtonProps {
    getEditorText: () => string;
    questionId: string;
    roomId: string;
    attemptStartedAt: Date;
    collaboratorId: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({
    getEditorText,
    questionId,
    roomId,
    attemptStartedAt,
    collaboratorId,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editorContent, setEditorContent] = useState("");

    const showModal = () => {
        const content = getEditorText();
        setEditorContent(content);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSave = async () => {
        try {
            await historyUseCases.updateUserHistory(
                questionId,
                roomId,
                attemptStartedAt.getTime().toString(),
                Date.now().toString(),
                collaboratorId,
                getEditorText(),
            );
            message.success("Your work has been saved successfully.");
            setIsModalVisible(false);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Failed to save:", error.message);
                message.error(`Failed to save: ${error.message}`);
            } else {
                console.error("Unknown error occurred during saving");
                message.error("Unknown error occurred during saving");
            }
        }
    };

    return (
        <>
            <Button
                onClick={showModal}
                type="text"
                icon={<SaveOutlined />}
                className={styles.submitButton}
            >
                Save
            </Button>
            <Modal
                title="Confirm Save"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel} color='danger'>
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        Save
                    </Button>,
                ]}
                destroyOnClose
            >
                <p>Do you want to save your current work?</p>
                <pre className={styles.modalContent}>{editorContent}</pre>
            </Modal>
        </>
    );
};

export default SaveButton;
