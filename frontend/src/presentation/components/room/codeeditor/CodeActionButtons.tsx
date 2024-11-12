import { Button } from "antd";
import { useCollaboration } from "domain/context/CollaborationContext";
import { PlayCircleOutlined } from "@ant-design/icons";
import styles from "./CodeActionButtons.module.css";
import SubmitButton from "./SubmitButton";

interface CodeActionButtonsProps {
    disabled?: boolean;
    getEditorText: () => string;
    questionId: string;
    roomId: string;
    attemptStartedAt: Date;
    collaboratorId: string;
}
export const CodeActionButtons: React.FC<CodeActionButtonsProps> = ({ 
    disabled = false,
    getEditorText,
    questionId,
    roomId,
    attemptStartedAt,
    collaboratorId,
}) => {
    const { handleExecuteCode } = useCollaboration();
    return (
        <>
            <Button
                onClick={async () => {
                    await handleExecuteCode();
                }}
                className={styles.runButton}
                icon={<PlayCircleOutlined />}
                disabled={disabled}
            >
                Run
            </Button>
            <SubmitButton
                getEditorText={getEditorText}
                questionId={questionId}
                roomId={roomId}
                attemptStartedAt={attemptStartedAt}
                collaboratorId={collaboratorId}
            />
        </>
    );
};
