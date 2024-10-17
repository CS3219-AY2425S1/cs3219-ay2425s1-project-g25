import React from "react";
import { Card, Tag } from "antd";
import { Category } from "domain/entities/Category";
import styles from "./SelectedCategories.module.css"; // Create a new module for styling

interface SelectedCategoriesProps {
    categories: Category[];
}

export const SelectedCategories: React.FC<SelectedCategoriesProps> = ({ categories }) => {
    return (
        <Card className={styles.categoriesCard}>
            {categories.length > 0 ? (
                <div className={styles.categoriesContainer}>
                    {categories.map((category) => (
                        <Tag key={category._id} className={styles.categoryTag}>
                            {category.name}
                        </Tag>
                    ))}
                </div>
            ) : (
                <p className={styles.noCategories}>No categories selected</p>
            )}
        </Card>
    );
};
