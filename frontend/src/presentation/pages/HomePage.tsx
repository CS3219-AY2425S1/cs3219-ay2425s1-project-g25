import React, { useState, useEffect } from "react";
import styles from "./HomePage.module.css";
import { FindPeerButton } from "presentation/components/buttons/FindPeerButton";
import { ProfileContainer } from "presentation/components/ProfileContainer";
import { RecentAttemptsTable } from "presentation/components/RecentAttemptsTable";
import { QuestionFilters } from "presentation/components/QuestionFilters";
import { SelectedCategories } from "presentation/components/SelectedCategories";
import { MatchingModal } from "presentation/components/modals/MatchingModal";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Category } from "domain/entities/Category";

const HomePage: React.FC = () => {
    const [filters, setFilters] = useState({
        selectedDifficulty: "All",
        selectedCategories: [] as Category[],
        searchTerm: ""
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [counter, setCounter] = useState(30);

    const handleFiltersChange = (newFilters: {
        selectedDifficulty: string;
        selectedCategories: Category[];
        searchTerm: string;
    }) => {
        setFilters(newFilters);
    };

    const handleFindPeerClick = () => {
        setIsModalVisible(true);
        setIsMatching(true);
        setCounter(3);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (isModalVisible && counter > 0) {
            timer = setInterval(() => {
                setCounter((prevCounter) => prevCounter - 1);
            }, 1000);
        }
        if (counter === 0) {
            setIsMatching(false);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isModalVisible, counter]);

    const handleModalClose = () => {
        setIsModalVisible(false);
        setIsMatching(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftContainer}>
                <h1 className={styles.headline}>Find a peer and practice together!</h1>
                <FindPeerButton onClick={handleFindPeerClick} />
                <div className={styles.selectRow}>
                    <QuestionFilters onFiltersChange={handleFiltersChange} showSearchBar={false} />
                </div>
                <div className={styles.selectRow}>
                    <SelectedCategories categories={filters.selectedCategories} />
                </div>
                <Tooltip
                    className={styles.tooltip}
                    title="You will be matched with a user who has selected the same difficulty level as you"
                >
                    <InfoCircleOutlined style={{ fontSize: "16px", color: "#1890ff", cursor: "pointer" }} />
                </Tooltip>
            </div>
            <div className={styles.rightContainer}>
                <ProfileContainer />
                <RecentAttemptsTable />
            </div>
            <MatchingModal visible={isModalVisible} onClose={handleModalClose} simulateFoundOrFail={"found"} />
        </div>
    );
};

export default HomePage;
