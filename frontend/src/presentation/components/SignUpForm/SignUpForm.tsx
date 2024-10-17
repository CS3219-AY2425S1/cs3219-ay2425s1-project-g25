import React, { useState } from "react";
import styles from "./SignUpForm.module.css";
import { useNavigate } from "react-router-dom";
import { handleError } from "presentation/utils/errorHandler";
import { useAuth } from "domain/contexts/AuthContext";
import { Form, Input } from "antd";
import { SIGN_UP_FORM_FIELDS } from "presentation/utils/constants";
import { useForm } from "antd/es/form/Form";
import { IUserRegisterInput } from "domain/users/IUser";
import { toast } from "react-toastify";
import { getEqualityValidator, getPasswordStrengthValidator, validateMessages } from "presentation/utils/formUtils";
import { PasswordInputLabel } from "../common/PasswordInputLabel/PasswordInputLabel";

export const SignUpForm: React.FC = () => {
    const [form] = useForm();

    const navigate = useNavigate();
    const { register } = useAuth();

    const { FIELD_EMAIL, FIELD_USERNAME, FIELD_PASSWORD, FIELD_CONFIRM_PASSWORD } = SIGN_UP_FORM_FIELDS;
    const handleSubmit = async (
        input: IUserRegisterInput & { [key in typeof FIELD_CONFIRM_PASSWORD.name]: string }
    ) => {
        const { email, username, password } = input;
        try {
            await register(email, password, username);
            navigate("/home");
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
    };

    return (
        <div className={styles.container}>
            <Form
                layout="vertical"
                onFinish={handleSubmit}
                className={styles.form}
                form={form}
                requiredMark={false}
                validateMessages={validateMessages}
            >
                <h2 className={styles.title}>Sign Up</h2>
                <Form.Item
                    label={FIELD_EMAIL.label}
                    name={FIELD_EMAIL.name}
                    className={styles.formItem}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <Input type="email" placeholder="Email" required className={styles.input} />
                </Form.Item>
                <Form.Item
                    label={FIELD_USERNAME.label}
                    name={FIELD_USERNAME.name}
                    className={styles.formItem}
                    rules={[{ required: true, whitespace: true }]}
                >
                    <Input type="text" placeholder="Username" required className={styles.input} />
                </Form.Item>
                <Form.Item
                    label={<PasswordInputLabel labelText={FIELD_PASSWORD.label} />}
                    name={FIELD_PASSWORD.name}
                    className={styles.formItem}
                    rules={[{ validator: getPasswordStrengthValidator() }]}
                >
                    <Input.Password placeholder="Password" required className={styles.input} autoComplete="off" />
                </Form.Item>
                <Form.Item
                    label={FIELD_CONFIRM_PASSWORD.label}
                    name={FIELD_CONFIRM_PASSWORD.name}
                    className={styles.formItem}
                    rules={[{ validator: getEqualityValidator(form, FIELD_PASSWORD.name, "Passwords do not match") }]}
                >
                    <Input.Password
                        placeholder="Confirm password"
                        required
                        className={styles.input}
                        autoComplete="off"
                    />
                </Form.Item>

                <button type="submit" className={styles.button}>
                    Sign Up
                </button>
            </Form>
        </div>
    );
};
