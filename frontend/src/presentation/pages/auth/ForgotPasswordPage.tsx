import { Button, Form, Input, Spin } from "antd";
import React, { useState } from "react";
import styles from "./ForgotPasswordPage.module.css";
import { toast } from "react-toastify";
import { userUseCases } from "domain/usecases/UserUseCases";
import { handleError } from "presentation/utils/errorHandler";
import { Link } from "react-router-dom";

export const ForgotPasswordPage: React.FC<{}> = () => {
    const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

    const handleSendPasswordResetLink = async (input: { email: string }) => {
        try {
            setIsSendingEmail(true);
            const email = input.email;
            await userUseCases.forgetPassword(email);
            toast.success("Password reset link sent to your email!");
        } catch (err) {
            toast.error(handleError(err));
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.forgotPasswordForm}>
                <div>
                    <h2>Forgot Password</h2>
                    <p>Forgot your password? Enter your email address and we'll send you a password reset link.</p>
                </div>

                <Form layout="vertical" onFinish={handleSendPasswordResetLink}>
                    <Form.Item label="Email" name="email">
                        <Input type="email" placeholder="Your email address" />
                    </Form.Item>
                    <Button className={styles.sendBtn} htmlType="submit" disabled={isSendingEmail}>
                        {isSendingEmail ? (
                            <>
                                <Spin />
                                <span style={{ marginLeft: "8px" }}>Sending email</span>
                            </>
                        ) : (
                            "Send password reset link"
                        )}
                    </Button>
                </Form>
                <Link to="/login" className={styles.loginLink}>
                    Back to login
                </Link>
            </div>
        </div>
    );
};
