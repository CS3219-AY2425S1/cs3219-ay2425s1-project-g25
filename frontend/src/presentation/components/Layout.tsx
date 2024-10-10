import React from "react";
import { Layout as AntLayout } from "antd";
import styles from "./Layout.module.css";
import PeerPrepLogo from '../../assets/images/PeerPrepLogo.png'

const { Content, Header } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AntLayout className={styles.layout}>
            <Header className={styles.header}>
                <img src={PeerPrepLogo} alt="PeerPrep Logo" width="7%"/>
            </Header>
            <Content className={styles.content}>{children}</Content>
        </AntLayout>
    );
};

export default Layout;
