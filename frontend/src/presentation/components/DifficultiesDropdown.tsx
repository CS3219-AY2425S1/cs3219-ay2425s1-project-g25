import styles from "./DifficultiesDropdown.module.css";
import React from "react";
import { Dropdown, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { Category } from "domain/entities/Category";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";

export const DifficultiesDropdown: React.FC = () => {

    const [items, setItems] = React.useState<MenuProps['items']>([]);


    React.useEffect(() => {
        // Hardcoded for now:
        setItems([
            {
                label: <span style={{ color: 'green' }}>Easy</span>,
                key: 1,
            },
            {
                label: <span style={{ color: 'orange' }}>Medium</span>,
                key: 2,
            },
            {
                label: <span style={{ color: 'red' }}>Hard</span>,
                key: 3,
            },
        ])
    }, []);

    return (<Dropdown
            trigger={["click"]}
            placement="bottomLeft"
            menu={{ items }}
        >
        <Button className={styles.dropdown}>
            Choose difficulty <DownOutlined />
        </Button>
    </Dropdown>)
};
