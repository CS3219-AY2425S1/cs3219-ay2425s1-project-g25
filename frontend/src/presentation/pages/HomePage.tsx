import React, { useState, useCallback } from "react";
import styles from "./HomePage.module.css";
import { FindPeerButton } from "presentation/components/buttons/FindPeerButton";
import { ProfileContainer } from "presentation/components/ProfileContainer";
import { RecentAttemptsTable } from "presentation/components/RecentAttemptsTable";
import { QuestionFilters } from "presentation/components/QuestionFilters";
import { SelectedCategories } from "presentation/components/SelectedCategories";
import { MatchingModal } from "presentation/components/modals/MatchingModal";
import { Tooltip, message } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Category } from "domain/entities/Category";
import { useAuth } from "domain/context/AuthContext";
import { ValidationError } from "presentation/utils/errors";
import { useMatchmaking } from "domain/context/MatchmakingContext";
import { MatchmakingValidator } from "domain/validation/MatchmakingValidator";

const HomePage: React.FC = () => {
    const [filters, setFilters] = useState({
        selectedDifficulty: null as string | null,
        selectedCategories: [] as Category[] | null,
        searchTerm: ""
    });

    const { startMatching, state } = useMatchmaking();
    const { user } = useAuth();

    const handleFiltersChange = (newFilters: {
        selectedDifficulty: string | null;
        selectedCategories: Category[] | null;
        searchTerm: string;
    }) => {
        setFilters(newFilters);
    };

    const startMatchingProcess = useCallback(() => {
        try {
            const correctedInput = MatchmakingValidator.validateAndCorrectMatchmakingInput({
                username: user?.username,
                email: user?.email,
                selectedCategories: filters.selectedCategories,
                selectedDifficulty: filters.selectedDifficulty
            });
            startMatching(correctedInput.selectedCategories[0].name, correctedInput.selectedDifficulty);
        } catch (error) {
            if (error instanceof ValidationError) {
                message.error(error.message);
            }
        }
    }, [user, filters, startMatching]);

    const handleFindPeerClick = () => {
        startMatchingProcess();
    };

    const handleRetry = () => {
        startMatchingProcess();
    };

    if (!user) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.leftContainer}>
                <h1 className={styles.headline}>Find a peer and practice together!</h1>
                <FindPeerButton onClick={handleFindPeerClick} />
                <div className={styles.selectRow}>
                    <QuestionFilters
                        isSingleCategory={true}
                        onFiltersChange={handleFiltersChange}
                        showSearchBar={false}
                    />
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
                <div className={styles.profileContainer}>
                    <ProfileContainer />
                </div>
                <div className={styles.recentAttempsContainer}>
                    <RecentAttemptsTable />
                </div>
            </div>
            <MatchingModal onRetry={handleRetry} />
        </div>
    );
};

export default HomePage;
