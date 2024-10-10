import React from "react";
import { Layout as AntLayout } from "antd";
import styles from "./Layout.module.css";
import PeerPrepLogo from "../../assets/images/PeerPrepLogo.png";
import { useAuth } from "domain/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
const { Content, Header } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    return (
        <AntLayout className={styles.layout}>
            <Header className={styles.header}>
                <img src={PeerPrepLogo} alt="PeerPrep Logo" width="7%" />
                {isLoggedIn && <LogoutOutlined onClick={handleLogout} />}
            </Header>
            <Content className={styles.content}>{children}</Content>
        </AntLayout>
    );
};

export default Layout;
