import styles from "./HomePage.module.css";
import React from "react";
import { FindPeerButton } from "presentation/components/buttons/FindPeerButton";
import { CategoriesDropdown } from "presentation/components/CategoriesDropdown";
import { DifficultiesDropdown } from "presentation/components/DifficultiesDropdown";
import { ProfileContainer } from "presentation/components/ProfileContainer";
import { RecentAttemptsTable } from "presentation/components/RecentAttemptsTable";
import { CustomTooltip } from "presentation/components/common/CustomTooltip";

const HomePage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.leftContainer}>
                <h1 className={styles.headline}>Find a peer and practice together!</h1>
                <FindPeerButton />
                <div className={styles.selectRow}>
                    <CategoriesDropdown />
                    <DifficultiesDropdown />
                </div>
                <div className={styles.tooltip}>
                    <CustomTooltip title="You will be matched with a user who has selected the same difficulty level as you" />
                </div>
            </div>
            <div className={styles.rightContainer}>
                <ProfileContainer />
                <RecentAttemptsTable />
            </div>
        </div>
    );
};

export default HomePage;
