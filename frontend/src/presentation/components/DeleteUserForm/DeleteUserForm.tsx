import { Button, Input } from "antd";
import { User } from "domain/entities/User";
import styles from "./DeleteUserForm.module.css";
import { useAuth } from "domain/context/AuthContext";
import { toast } from "react-toastify";
import { handleError } from "presentation/utils/errorHandler";
import { useState } from "react";

interface DeleteUserFormProps {
    user: User;
    onSubmit?: () => void;
    onCancel?: () => void;
}
export const DeleteUserForm: React.FC<DeleteUserFormProps> = ({ user: userToDelete, onSubmit, onCancel }) => {
    const [confirmationText, setConfirmationText] = useState("");
    const { user, deactivateUser } = useAuth();
    const isDeletingSelf = user?._id === userToDelete._id;

    const handleDeleteUser = async () => {
        try {
            await deactivateUser(userToDelete?._id);
            toast.success(`Successfully deleted ${isDeletingSelf ? "your account" : userToDelete.username}`);
            onSubmit?.();
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
    };

    const handleCancel = () => {
        setConfirmationText("");
        onCancel?.();
    };

    const textToMatch = `delete/${user?.username}`;
    const isConfirmBtnDisabled = isDeletingSelf && confirmationText !== textToMatch;

    return (
        <>
            <p>Are you sure you want to delete {isDeletingSelf ? "your account" : <b>{userToDelete.username}</b>}?</p>
            {isDeletingSelf && (
                <Input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={`Type "${textToMatch}" to confirm`}
                />
            )}
            <div className={styles.btnGroup}>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" onClick={handleDeleteUser} disabled={isConfirmBtnDisabled}>
                    Confirm
                </Button>
            </div>
        </>
    );
};
