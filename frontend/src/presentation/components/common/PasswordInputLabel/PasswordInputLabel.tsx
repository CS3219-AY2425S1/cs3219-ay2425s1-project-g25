import { CustomTooltip } from "../CustomTooltip";
import styles from "./PasswordInputLabel.module.css";
interface PasswordInputLabelProps {
    labelText?: string;
}

export const PasswordInputLabel: React.FC<PasswordInputLabelProps> = ({ labelText = "Password" }) => {
    const renderPasswordRules = () => (
        <div className={styles.passwordRulesContainer}>
            <p>Password must meet the minimum requirements:</p>
            <ul>
                <li>Be at least 8 charactes long</li>
                <li>Include at least 1 lowercase letter</li>
                <li>Include at least 1 uppercase letter</li>
                <li>Include at least 1 digit</li>
                <li>Include at least one special character (@$!%*?&)</li>
            </ul>
        </div>
    );
    return (
        <div className={styles.container}>
            <label>{labelText}</label>
            <CustomTooltip title={renderPasswordRules} overlayStyle={{ minWidth: "300px" }} placement="topLeft" />
        </div>
    );
};
