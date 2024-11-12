import styles from "./LoginPage.module.css";
import { Col, Row } from "antd";
import { useAuth } from "domain/context/AuthContext";
import { AuthLogo } from "presentation/components/auth/AuthLogo";
import { LoginForm } from "presentation/components/auth/LoginForm/LoginForm";
import { Navigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn === undefined ? (
        <p>Loading...</p>
    ) : isLoggedIn ? (
        <Navigate to="/" />
    ) : (
        <div className={styles.container}>
            <div className={styles.scrollContainer}>
                <Row className={styles.contentRow}>
                    <Col span={14} className={styles.col}>
                        <AuthLogo />
                    </Col>
                    <Col span={10} className={styles.col}>
                        <LoginForm />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default LoginPage;
