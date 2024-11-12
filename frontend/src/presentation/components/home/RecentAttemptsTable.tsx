// RecentAttemptsTable.tsx
import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Badge, Button, message, Empty, Modal, Tabs, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from "./RecentAttemptsTable.module.css";
import { HistoryEntry } from "domain/entities/HistoryEntry";
import { historyUseCases } from "domain/usecases/HistoryUseCases";
import { ReactMarkdown } from "../common/ReactMarkdown";
import TabPane from "antd/es/tabs/TabPane";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, TeamOutlined } from "@ant-design/icons";

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  const date = new Date(dateString);
  return date.toLocaleString(undefined, options);
};

const calculateDuration = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate.getTime() - startDate.getTime();

  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let duration = '';
  if (hours > 0) duration += `${hours}h `;
  if (minutes > 0) duration += `${minutes}m `;
  if (seconds > 0) duration += `${seconds}s`;

  return duration.trim() || '0s';
};

export const RecentAttemptsTable: React.FC = () => {
  const navigate = useNavigate();

  // State Definitions
  const [recentAttemptsData, setRecentAttemptsData] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Modal State for Viewing Codes
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentCodes, setCurrentCodes] = useState<string[]>([]);

  // Modal State for Viewing Description
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState<boolean>(false);
  const [currentDescription, setCurrentDescription] = useState<string>('');

  // Fetch Recent Attempts on Component Mount
  useEffect(() => {
    fetchRecentAttempts();
  }, []);

  // Function to Fetch Recent Attempts
  const fetchRecentAttempts = async () => {
    setLoading(true);
    try {
      const data = await historyUseCases.getAllUserHistories();
      setRecentAttemptsData(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to fetch recent attempts:", error.message);
        message.error(`Failed to fetch recent attempts: ${error.message}`);
      } else {
        console.error("Unknown error occurred during data fetching");
        message.error("Unknown error occurred during data fetching");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to Clear All Attempts
  const handleClearAllAttempts = async () => {
    try {
      await historyUseCases.deleteAllUserHistories();
      message.success("All attempts cleared successfully");
      setRecentAttemptsData([]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to clear attempts:", error.message);
        message.error(`Failed to clear attempts: ${error.message}`);
      } else {
        console.error("Unknown error occurred during attempt clearing");
        message.error("Unknown error occurred during attempt clearing");
      }
    }
  };

  // Function to Delete Selected Attempts
  const handleDeleteSelectedAttempts = async () => {
    try {
      if (selectedRowKeys.length === 0) {
        message.info("No attempts selected");
        return;
      }
      await historyUseCases.deleteSelectedUserHistories(selectedRowKeys.map((key) => key.toString()));
      message.success(`${selectedRowKeys.length} attempt(s) deleted successfully`);
      setRecentAttemptsData((prevData) =>
        prevData.filter((attempt) => !selectedRowKeys.includes(attempt.key))
      );
      setSelectedRowKeys([]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to delete attempts:", error.message);
        message.error(`Failed to delete attempts: ${error.message}`);
      } else {
        console.error("Unknown error occurred during attempt deletion");
        message.error("Unknown error occurred during attempt deletion");
      }
    }
  };

  // Function to Show Modal with Codes
  const showModal = (attemptCodes: string[], attemptId: string) => {
    setCurrentCodes(attemptCodes);
    setIsModalVisible(true);
  };

  // Function to Close Modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentCodes([]);
  };

  // Function to Show Description Modal
  const showDescriptionModal = (description: string) => {
    setCurrentDescription(description);
    setIsDescriptionModalVisible(true);
  };

  // Function to Close Description Modal
  const handleDescriptionModalClose = () => {
    setIsDescriptionModalVisible(false);
    setCurrentDescription('');
  };

  // Define Columns for the Table
  const columns: ColumnsType<HistoryEntry> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.lastAttemptSubmittedAt).getTime() - new Date(b.lastAttemptSubmittedAt).getTime(),
      render: (_text, record) => {
        const formattedStartDate = formatDate(record.attemptStartedAt);
        const formattedEndDate = formatDate(record.lastAttemptSubmittedAt);
        const duration = calculateDuration(record.attemptStartedAt, record.lastAttemptSubmittedAt);
        return (
          <div className={styles.dateContainer}>
            <div>
              <Typography.Text strong>Attempt Start:</Typography.Text>
            </div>
            <div>
              {formattedStartDate}
            </div>
            <div>
              <Typography.Text strong>Latest Submission:</Typography.Text>
            </div>
            <div>
              {formattedEndDate}
            </div>
            <div>
              <Typography.Text strong>Duration:</Typography.Text>
            </div>
            <div>
              {duration}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: HistoryEntry) => (
        <Typography.Link onClick={() => showDescriptionModal(record.description)}>
          {text}
        </Typography.Link>
      ),
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      filters: [
        { text: 'Easy', value: 'Easy' },
        { text: 'Medium', value: 'Medium' },
        { text: 'Hard', value: 'Hard' },
      ],
      onFilter: (value, record) => record.difficulty === value,
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
    {
      title: 'Actions',
      key: 'action',
      render: (_text, record) => (
        <Space size="middle" className={styles.actionsButton}>
          <Button
            type="link"
            onClick={() => showModal(record.attemptCodes, record.key)}
            icon={<EyeOutlined />}
            aria-label={`View past code for attempt ${record.key}`}
          >
            View Past Code
          </Button>
          {record.roomId && (
            <Button
              type="link"
              onClick={() => navigate(`/room/${record.roomId}`)}
              icon={<TeamOutlined />}
              aria-label={`Rejoin room ${record.roomId}`}
            >
              Rejoin
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Row Selection Configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h3 className={styles.header}>Recent Attempts</h3>
        <div className={styles.actions}>
          <Button type="link" onClick={fetchRecentAttempts}>
            Refresh
          </Button>
          <Button type="link" onClick={handleDeleteSelectedAttempts} disabled={selectedRowKeys.length === 0}>
            Delete Selected
          </Button>
          <Button type="link" onClick={handleClearAllAttempts} disabled={recentAttemptsData.length === 0}>
            Clear All
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={recentAttemptsData}
        loading={loading}
        rowSelection={rowSelection}
        locale={{
          emptyText: <Empty description="No attempts yet" />,
        }}
        rowKey="key"
      />
      
      <Modal
        title="Past Code Attempts"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {currentCodes.length > 0 ? (
          <Tabs
            defaultActiveKey={currentCodes.length.toString()}
            type="card"
            tabPosition="top"
            size="small"
            style={{ height: '600px', overflow: 'auto' }}
          >
            {currentCodes.map((code, index) => {
              const tabKey = (index + 1).toString();
              const tabLabel = `Attempt ${index + 1}`;
              const formattedCode = `\`\`\`\n${code.replace(/\r\n/g, '\n\n')}\n\`\`\``;
              return (
                <TabPane
                  tab={tabLabel}
                  key={tabKey}
                  style={{ height: '100%', overflow: 'auto' }}
                >
                  <div style={{ height: '100%', overflow: 'auto', padding: '16px' }}>
                    <ReactMarkdown isReadOnly value={formattedCode} />
                  </div>
                </TabPane>
              );
            })}
          </Tabs>
        ) : (
          <Empty description="No code available" />
        )}
      </Modal>

      <Modal
        title="Question Description"
        open={isDescriptionModalVisible}
        onCancel={handleDescriptionModalClose}
        footer={null}
        width={800}
      >
        <div style={{ height: '100%', overflow: 'auto', padding: '16px' }}>
          <ReactMarkdown isReadOnly value={currentDescription} />
        </div>
      </Modal>
    </div>
  );
};

export default RecentAttemptsTable;
