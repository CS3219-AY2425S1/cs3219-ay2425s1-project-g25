import styles from "./ProfileContainer.module.css";
import React, { useState } from "react";
import SampleProfilePicture from "../../../assets/images/sample-profile-picture.jpg";
import { EditOutlined, MailOutlined, UnorderedListOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "domain/context/AuthContext";
import { Modal } from "antd";
import { UpdateProfileForm } from "../users/UpdateProfileForm/UpdateProfileForm";
import { Link } from "react-router-dom";
import { DeleteUserForm } from "../users/DeleteUserForm/DeleteUserForm";

export const ProfileContainer: React.FC = () => {
    const { user, isUserAdmin } = useAuth();
    const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

    if (!user) {
        return <p>loading...</p>;
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.profileContainer}>
                    <img className={styles.profilePicture} src={SampleProfilePicture} alt="profile" />
                    <div className={styles.profileDetailsContainer}>
                        <div className={styles.nameRow}>
                            <h2 className={styles.name}>{user?.username}</h2>
                            <EditOutlined className={styles.editIcon} onClick={() => setIsEditingProfile(true)} />
                        </div>
                        <div className={styles.email}>
                            <MailOutlined />
                            <span className={styles.email}>{user?.email}</span>
                        </div>

                        <div className={styles.deactivateAndadminLinksContainer}>
                            <span onClick={() => setIsDeletingAccount(true)} className={styles.deactivate}>
                                Deactivate account
                            </span>
                            {isUserAdmin && (
                                <div className={styles.adminLinkItem}>
                                    <UnorderedListOutlined />
                                    <Link to="/question-management">Manage questions</Link>
                                </div>
                            )}
                            {isUserAdmin && (
                                <div className={styles.adminLinkItem}>
                                    <UserOutlined />
                                    <Link to="/user-management">Manage users</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Modal open={isEditingProfile} closable={false} title="Update profile" footer={null} maskClosable={false}>
                <UpdateProfileForm
                    user={user}
                    onSubmit={() => setIsEditingProfile(false)}
                    onCancel={() => setIsEditingProfile(false)}
                />
            </Modal>
            <Modal
                open={isDeletingAccount}
                closable={false}
                title="Deactivate account"
                footer={null}
                maskClosable={false}
            >
                <DeleteUserForm
                    user={user}
                    onSubmit={() => setIsDeletingAccount(false)}
                    onCancel={() => setIsDeletingAccount(false)}
                />
            </Modal>
        </>
    );
};
