import React from "react";
import { Card, Tag } from "antd";
import { Category } from "domain/entities/Category";
import styles from "./SelectedCategories.module.css";

interface SelectedCategoriesProps {
    categories: Category[] | null; 
}

export const SelectedCategories: React.FC<SelectedCategoriesProps> = ({ categories }) => {
    const isAllCategorySelected = categories === null || categories.length === 0;

    return (
        <Card className={styles.categoriesCard}>
            {isAllCategorySelected ? (
                <Tag className={styles.allCategoryTag}>All categories selected</Tag>
            ) : (
                <div className={styles.categoriesContainer}>
                    {categories.map((category) => (
                        <Tag key={category._id || category.name} className={styles.categoryTag}>
                            {category.name}
                        </Tag>
                    ))}
                </div>
            )}
        </Card>
    );
};
