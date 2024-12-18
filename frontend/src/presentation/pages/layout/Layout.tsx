import React from "react";
import { Layout as AntLayout } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Layout.module.css";
import PeerPrepLogo from "../../../assets/images/PeerPrepLogo.png";
import MatchingFloatingButton from "../../components/common/buttons/MatchingFloatingButton";
import { ArrowLeftOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "domain/context/AuthContext";

const { Content, Header } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Failed to log out user", err);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const showBackButton = location.pathname !== "/" && window.history.length > 1;

    return (
        <AntLayout className={styles.layout}>
            <Header className={styles.header}>
                <Link to="/" style={{ display: "flex" }}>
                    <img src={PeerPrepLogo} alt="PeerPrep Logo" width="100px" />
                </Link>

                <div className={styles.iconGroup}>
                    {showBackButton && <ArrowLeftOutlined className={styles.backButton} onClick={handleBack} />}
                    {isLoggedIn && <LogoutOutlined className={styles.logoutButton} onClick={handleLogout} />}
                </div>
            </Header>

            <Content className={styles.content}>
                {children}
                <MatchingFloatingButton />
            </Content>
        </AntLayout>
    );
};

export default Layout;
