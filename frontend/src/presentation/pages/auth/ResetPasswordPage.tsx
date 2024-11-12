import React, { useState } from "react";
import styles from "./ResetPasswordPage.module.css";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Form, Input, Button } from "antd";
import { getEqualityValidator, getPasswordStrengthValidator } from "presentation/utils/formUtils";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import { PasswordInputLabel } from "presentation/components/common/PasswordInputLabel/PasswordInputLabel";
import { userUseCases } from "domain/usecases/UserUseCases";
import { handleError } from "presentation/utils/errorHandler";

export const ResetPasswordPage: React.FC<{}> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") ?? "";

    const [form] = useForm();

    const handleResetPassword = async (input: { password: string; confirmPassword: string }) => {
        try {
            setIsLoading(true);
            const { password, confirmPassword } = input;
            if (password !== confirmPassword) {
                // Should've already been caught by validator, but just in case
                toast.error("Passwords do not match");
            }
            await userUseCases.resetPassword(password, token);
            toast.success("Successfully resetted password");
            navigate("/login");
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.resetPasswordForm}>
                <h2 className={styles.header}>Reset Password</h2>
                <Form form={form} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item
                        label={<PasswordInputLabel labelText="New Password" />}
                        name="password"
                        rules={[{ validator: getPasswordStrengthValidator() }]}
                    >
                        <Input type="password" placeholder="New Password" />
                    </Form.Item>
                    <Form.Item
                        label="Confirm New Password"
                        name="confirmPassword"
                        rules={[{ validator: getEqualityValidator(form, "password", "Passwords do not match") }]}
                    >
                        <Input type="password" placeholder="Confirm New Password" />
                    </Form.Item>
                    <Button className={styles.submitBtn} htmlType="submit" disabled={isLoading}>
                        Reset Password
                    </Button>
                </Form>
                <Link to="/login" className={styles.loginLink}>
                    Back to login
                </Link>
            </div>
        </div>
    );
};
