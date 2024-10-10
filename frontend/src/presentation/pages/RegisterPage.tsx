import styles from './RegisterPage.module.css';
import { Col, Row } from 'antd';
import { AuthLogo } from 'presentation/components/AuthLogo';
import { SignUpForm } from 'presentation/components/SignUpForm/SignUpForm';

const RegisterPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.scrollContainer}>
                <Row className={styles.contentRow}>
                    <Col span={14} className={styles.col}>
                        <AuthLogo />
                    </Col>
                    <Col span={10} className={styles.col}>
                        <SignUpForm />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default RegisterPage;