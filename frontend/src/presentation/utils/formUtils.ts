import { FormInstance } from "antd";

export const validateMessages = {
    required: "${label} is required",
    whitespace: "${label} is required"
};

export const getEqualityValidator =
    (form: FormInstance, fieldToMatch: string, errorMessage?: string) => async (_: any, value: string) => {
        if (value !== form.getFieldValue(fieldToMatch)) {
            return Promise.reject(new Error(errorMessage ?? `Field does not match with ${fieldToMatch}`));
        }
        return Promise.resolve();
    };

export const getPasswordStrengthValidator =
    (errorMessage?: string) => async (_: any, value: string) => {
        if (!isPasswordStrong(value)) {
            return Promise.reject(errorMessage ?? "Password not strong enough");
        }
        return Promise.resolve();
    };

export const isPasswordStrong = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
