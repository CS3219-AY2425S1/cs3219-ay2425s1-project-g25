import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
    searchTerm: string;
    onSearch: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    return (
        <div className={styles.searchBarWrapper}>
            <SearchOutlined className={styles.searchIcon} />
            <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={handleInputChange}
                allowClear
                className={styles.searchInput}
                variant="borderless"
            />
        </div>
    );
};
