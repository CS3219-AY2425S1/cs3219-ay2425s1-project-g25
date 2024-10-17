import styles from "./CategoriesDropdown.module.css";
import React from "react";
import { Dropdown, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { Category } from "domain/entities/Category";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";

export const CategoriesDropdown: React.FC = () => {

    const [items, setItems] = React.useState<MenuProps['items']>([]);


    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories: Category[] = await categoryUseCases.getAllCategories();
                const validCategories = categories.filter(
                    (category) =>
                        typeof category.name === 'string' &&
                        category.name.trim() !== "" &&
                        typeof category._id === 'string' &&
                        category._id.trim() !== ""
                );
                setItems(
                    validCategories.map((categoryObject, index) => ({
                        label: <span>{categoryObject.name}</span>,
                        key: index,
                    }))
                );
            } catch (error) {
                console.error("Failed to fetch categories", error);
                message.error("Failed to fetch categories.");
            }
        };

        fetchCategories();
    }, []);

    return (<Dropdown
            trigger={["click"]}
            placement="bottomLeft"
            menu={{ items }}
        >
        <Button className={styles.dropdown}>
            Choose topic <DownOutlined />
        </Button>
    </Dropdown>)
};
