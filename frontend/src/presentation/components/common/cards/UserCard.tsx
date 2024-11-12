import React, { useEffect, useState } from "react";
import { Card, Avatar, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import styles from "./UserCard.module.css";
import { userUseCases } from "domain/usecases/UserUseCases";

interface UserCardProps {
    userId: string;
}

const mockQuestions = [
    {
        id: 1,
        title: "Two Sum",
        link: "https://leetcode.com/problems/two-sum/"
    },
    {
        id: 2,
        title: "Add Two Numbers",
        link: "https://leetcode.com/problems/add-two-numbers/"
    },
    {
        id: 3,
        title: "Longest Substring Without Repeating Characters",
        link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
    }
];

export const UserCard: React.FC<UserCardProps> = ({ userId }) => {
    const [user, setUser] = useState<{
        _id: string;
        username: string;
        email: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const fetchedUser = await userUseCases.getUser(userId);
                console.log("Fetched User:", fetchedUser);
                setUser(fetchedUser);
            } catch (err) {
                setError("Error fetching user data");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Card className={styles.userInfoCard}>
            <div className={styles.userInfo}>
                <Avatar size={64} icon={<UserOutlined />} className={styles.userAvatar} />
                <h3>{user?.username || "Anonymous"}</h3>
                <p>{user?.email || "No email provided"}</p>
            </div>
            <h4>Question History</h4>
            <ul>
                {mockQuestions.map((question) => (
                    <li key={question.id}>
                        <a href={question.link} target="_blank" rel="noopener noreferrer">
                            {question.title}
                        </a>
                    </li>
                ))}
            </ul>
        </Card>
    );
};
