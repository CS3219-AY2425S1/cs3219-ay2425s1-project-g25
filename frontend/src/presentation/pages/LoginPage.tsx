import styles from './LoginPage.module.css';
import { Col, Row } from 'antd';
import { AuthLogo } from 'presentation/components/AuthLogo';
import { LoginForm } from 'presentation/components/LoginForm/LoginForm';

const LoginPage: React.FC = () => {
    return (
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