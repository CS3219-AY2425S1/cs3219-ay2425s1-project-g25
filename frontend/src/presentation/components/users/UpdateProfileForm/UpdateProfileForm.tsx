import { Button, Form, Input } from "antd";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { User } from "domain/entities/User";
import { UPDATE_PROFILE_FORM_FIELDS } from "presentation/utils/constants";
import { useState } from "react";
import styles from "./UpdateProfileForm.module.css";
import { useAuth } from "domain/context/AuthContext";
import { toast } from "react-toastify";
import { handleError } from "presentation/utils/errorHandler";
import { useForm } from "antd/es/form/Form";
import { IUserUpdateInput } from "domain/users/IUser";
import { getEqualityValidator, getPasswordStrengthValidator, validateMessages } from "presentation/utils/formUtils";
import { PasswordInputLabel } from "presentation/components/common/PasswordInputLabel/PasswordInputLabel";

interface UpdateProfileFormProps {
    user: User;
    onSubmit?: (updatedUser: User) => void;
    onCancel?: () => void;
}

export const UpdateProfileForm: React.FC<UpdateProfileFormProps> = ({ user, onSubmit, onCancel }) => {
    const [form] = useForm();
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const { updateUser } = useAuth();

    const { FIELD_USERNAME, FIELD_PASSWORD, FIELD_CONFIRM_PASSWORD, FIELD_EMAIL } = UPDATE_PROFILE_FORM_FIELDS;

    const handleCollapsePasswordFields = () => {
        resetPasswordFields();
        setIsUpdatingPassword(false);
    };
    const resetPasswordFields = () => {
        form.setFieldsValue({
            [FIELD_PASSWORD.name]: "",
            [FIELD_CONFIRM_PASSWORD.name]: ""
        });
    };
    const handleCancel = () => {
        resetPasswordFields();
        onCancel?.();
    };

    const initialFormValues = { [FIELD_USERNAME.name]: user.username, [FIELD_EMAIL.name]: user.email };

    const passwordsMatchValidator = getEqualityValidator(form, FIELD_PASSWORD.name, "Passwords do not match");
    const passwordStrengthValidator = getPasswordStrengthValidator();

    const handleSubmit = async (input: IUserUpdateInput & { [key in typeof FIELD_CONFIRM_PASSWORD.name]: string }) => {
        let payload: IUserUpdateInput = { username: input.username, email: input.email };
        if (isUpdatingPassword) {
            payload = { ...payload, password: input.password };
        }
        try {
            const updatedUser = await updateUser(user._id, payload);
            onSubmit?.(updatedUser);
            handleCollapsePasswordFields();
            toast.success("User profile updated");
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
    };

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            initialValues={initialFormValues}
            validateMessages={validateMessages}
            requiredMark={false}
        >
            <Form.Item
                label={FIELD_USERNAME.label}
                name={FIELD_USERNAME.name}
                className={styles.formItem}
                rules={[{ required: true, whitespace: true }]}
            >
                <Input type="text" placeholder={FIELD_USERNAME.label} />
            </Form.Item>
            <Form.Item
                label={FIELD_EMAIL.label}
                name={FIELD_EMAIL.name}
                className={styles.formItem}
                rules={[{ required: true, whitespace: true }]}
            >
                <Input type="email" placeholder={FIELD_EMAIL.label} />
            </Form.Item>

            <div className={styles.changePasswordLabel}>
                <p>Change Password</p>
                {!isUpdatingPassword ? (
                    <EditOutlined className={styles.icon} onClick={() => setIsUpdatingPassword(true)} />
                ) : (
                    <CloseOutlined className={styles.icon} onClick={handleCollapsePasswordFields} />
                )}
            </div>

            {isUpdatingPassword && (
                <div>
                    <Form.Item
                        label={<PasswordInputLabel labelText={FIELD_PASSWORD.label} />}
                        name={FIELD_PASSWORD.name}
                        className={styles.formItem}
                        rules={[{ validator: passwordStrengthValidator }]}
                    >
                        <Input.Password placeholder={FIELD_PASSWORD.label} autoComplete="off" />
                    </Form.Item>
                    <Form.Item
                        label={FIELD_CONFIRM_PASSWORD.label}
                        name={FIELD_CONFIRM_PASSWORD.name}
                        className={styles.formItem}
                        rules={[{ validator: passwordsMatchValidator }]}
                    >
                        <Input.Password placeholder={FIELD_CONFIRM_PASSWORD.label} autoComplete="off" />
                    </Form.Item>
                </div>
            )}
            <div className={styles.buttonGroup}>
                <Button type="default" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                    Save
                </Button>
            </div>
        </Form>
    );
};
