import { Button } from "antd";
import { User } from "domain/entities/User";
import styles from "./UpdateUserPrivilegeForm.module.css";
import { toast } from "react-toastify";
import { handleError } from "presentation/utils/errorHandler";
import { userUseCases } from "domain/usecases/UserUseCases";

interface UpdateUserPrivilegeFormProps {
    user: User;
    onSubmit?: (user: User) => void;
    onCancel?: () => void;
}
export const UpdateUserPrivilegeForm: React.FC<UpdateUserPrivilegeFormProps> = ({ user, onSubmit, onCancel }) => {
    const handlePromoteUser = async () => {
        try {
            const updatedUser = await userUseCases.updateUserPrivilege(user._id, true);
            toast.success(`Successfully promoted ${user.username} to admin`);
            onSubmit?.(updatedUser);
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
    };

    const handleCancel = () => {
        onCancel?.();
    };

    return (
        <>
            <p>
                Are you sure you want to promote <b>{user.username}</b> to admin?
            </p>

            <div className={styles.btnGroup}>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" onClick={handlePromoteUser}>
                    Confirm
                </Button>
            </div>
        </>
    );
};
