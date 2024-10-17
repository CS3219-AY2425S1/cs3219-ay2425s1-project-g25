import styles from "./ProfileContainer.module.css";
import React, { useState } from "react";
import SampleProfilePicture from "../../assets/images/sample-profile-picture.jpg";
import { EditOutlined } from "@ant-design/icons";
import { useAuth } from "domain/contexts/AuthContext";
import { Modal } from "antd";
import { UpdateProfileForm } from "./UpdateProfileForm/UpdateProfileForm";
import { Link } from "react-router-dom";

export const ProfileContainer: React.FC = () => {
    const { user, isUserAdmin } = useAuth();
    const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
    if (!user) {
        return <p>loading...</p>;
    }

    return (
        <>
            <div className={styles.container}>
                <img className={styles.profilePicture} src={SampleProfilePicture} />
                <div className={styles.profileDetailsContainer}>
                    <div className={styles.nameRow}>
                        <h2 className={styles.name}>{user?.username}</h2>
                        <EditOutlined className={styles.editIcon} onClick={() => setIsEditingProfile(true)} />
                    </div>
                    <p>{user?.email}</p>
                    <div className={styles.linksContainer}>
                        {isUserAdmin && <Link to="/questions">Manage questions</Link>}
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
        </>
    );
};
