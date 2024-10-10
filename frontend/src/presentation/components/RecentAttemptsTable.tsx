import styles from "./RecentAttemptsTable.module.css";
import React from "react";
import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Badge } from 'antd';

export const RecentAttemptsTable: React.FC = () => {

    interface RecentAttempt {
        key: string;
        date: string;
        title: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        topics: string[];
    }
      
    const recentAttemptsData: RecentAttempt[] = [
        {
          key: '1',
          date: '1/9/24',
          title: 'Reverse a String',
          difficulty: 'Easy',
          topics: ['Strings'],
        },
        {
          key: '2',
          date: '2/9/24',
          title: 'Binary Search',
          difficulty: 'Medium',
          topics: ['Binary Search', 'Arrays'],
        },
        {
          key: '3',
          date: '3/9/24',
          title: 'Merge K Sorted Lists',
          difficulty: 'Hard',
          topics: ['Linked List', 'Heap'],
        },
        {
            key: '4',
            date: '1/9/24',
            title: 'Reverse a String',
            difficulty: 'Easy',
            topics: ['Strings'],
          },
          {
            key: '5',
            date: '2/9/24',
            title: 'Binary Search',
            difficulty: 'Medium',
            topics: ['Binary Search', 'Arrays'],
          }
    ];

    const columns: ColumnsType<RecentAttempt> = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <Typography.Text>{text}</Typography.Text>,
        },
        {
          title: 'Difficulty',
          dataIndex: 'difficulty',
          key: 'difficulty',
          render: (difficulty: 'Easy' | 'Medium' | 'Hard') => {
            const color = difficulty === 'Easy' ? 'green' : difficulty === 'Medium' ? 'orange' : 'red';
            return (
                <Badge
                    color={color}
                    text={difficulty}
                />
            );
          },
        },
        {
          title: 'Topics',
          dataIndex: 'topics',
          key: 'topics',
          render: (topics: string[]) => (
            <>
                {topics.map((topic, index) => (
                    <Tag key={index} color="black" style={{ color: 'white' }}>
                        {topic}
                    </Tag>
                ))}
            </>
          ),
        },
    ];

    return (<div className={styles.container}>
        <div className={styles.headerRow}>
            <h3 className={styles.header}>Recent Attempts</h3>
            <a href="">View all</a>
        </div>
        <Table columns={columns} dataSource={recentAttemptsData} />
    </div>)
};
