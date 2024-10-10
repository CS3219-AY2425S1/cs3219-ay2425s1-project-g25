import styles from "./ProfileContainer.module.css";
import React from "react";
import SampleProfilePicture from "../../assets/images/sample-profile-picture.jpg";
import { EditOutlined } from '@ant-design/icons';
import { useAuth } from "domain/contexts/AuthContext";

export const ProfileContainer: React.FC = () => {

    const { user } = useAuth();

    return (<div className={styles.container}>
        <img className={styles.profilePicture} src={SampleProfilePicture} />
        <div className={styles.profileDetailsContainer}>
            <div className={styles.nameRow}>
                <h2 className={styles.name}>{user?.username}</h2>
                <EditOutlined className={styles.editIcon} />
            </div>
            <p>{user?.email}</p>
            <div className={styles.linksContainer}>
                <a href="">Change password</a>
                <a href="">Manage questions</a>
            </div>
        </div>
    </div>)
};
