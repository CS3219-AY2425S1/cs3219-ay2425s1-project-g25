import styles from "./AuthLogo.module.css";
import { Card } from "antd";
import PeerPrepLogo from "../../../assets/images/PeerPrepLogo.png"
import { useLocation } from "react-router-dom";
import { MESSAGES } from "presentation/utils/constants";
import { SignInSignUpButton } from "../common/buttons/SignInSignUpButton";

export const AuthLogo: React.FC = () => {
    const location = useLocation();
    const isRegister = location.pathname.includes("register");
    return (
        <div className={styles.cardWrapper}>
            <Card className={styles.card}>
                <div className={styles.content}>
                    <div>
                        <img src={PeerPrepLogo} alt="PeerPrep Logo" width="60%" />
                    </div>

                    <div className={styles.promptContainer}>
                        <h3 className={styles.h3}>{isRegister ? MESSAGES.SIGN_IN_PROMPT : MESSAGES.SIGN_UP_PROMPT}</h3>
                        <SignInSignUpButton />
                    </div>
                </div>
            </Card>
        </div>
    );
};
