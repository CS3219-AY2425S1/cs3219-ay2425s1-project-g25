import React, { useState } from "react";
import { Tag, Divider, Modal, Button, Card } from "antd";
import { Question } from "../../domain/entities/Question";
import { getDifficultyColor } from "../utils/QuestionUtils";
import styles from "./QuestionDetail.module.css";
import { EditQuestionForm } from "./EditQuestionForm/EditQuestionForm";
import { ReactMarkdown } from "./common/ReactMarkdown";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { questionUseCases } from "domain/usecases/QuestionUseCases";
import { toast } from "react-toastify";
import axios from "axios";

interface QuestionDetailProps {
    question: Question;
    onEdit?: (updatedQuestion: Question) => void;
    onDelete?: (deletedQuestion: Question) => void;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ question, onEdit, onDelete }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    const onEditQuestion = (updatedQuestion: Question) => {
        setIsEditModalOpen(false);
        onEdit?.(updatedQuestion);
    };

    const handleDeleteQuestion = async () => {
        try {
            await questionUseCases.deleteQuestion(question._id);
            toast.success(`Deleted question: ${question.title}`);
            setIsDeleteModalOpen(false);
            onDelete?.(question);
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Unable to delete question");
            }
        }
    };

    return (
        <>
            <Card className={styles.card}>
                <div className={styles.titleContainer}>
                    <div className={styles.titleAndLink}>
                        <h2>{question.title}</h2>
                        {question.url && (
                            <a href={question.url} target="_blank" rel="noopener noreferrer" aria-label="External Link">
                                <img src="/icons/external-link.svg" alt="External Link" width={24} />
                            </a>
                        )}
                    </div>
                    <div>
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => setIsDeleteModalOpen(true)}
                            aria-label="Delete Question"
                        />
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => setIsEditModalOpen(true)}
                            aria-label="Edit Question"
                        />
                    </div>
                </div>

                <Divider className={styles.divider} />
                <div className={styles.content}>
                    <ReactMarkdown isReadOnly value={question.description} />
                    <div className={styles.metaContainer}>
                        <div className={styles.difficultyContainer}>
                            <span className={styles.metaLabel}>Difficulty:</span>
                            <Tag color={getDifficultyColor(question.difficulty)} className={styles.difficultyTag}>
                                {question.difficulty}
                            </Tag>
                        </div>
                        <div className={styles.categoriesContainer}>
                            <span className={styles.metaLabel}>Categories:</span>
                            {question.categories.map((category) => (
                                <Tag key={category._id} color="blue" className={styles.categoryTag}>
                                    {category.name}
                                </Tag>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            <Modal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                title="Edit Question"
                footer={null}
                width={"90vw"}
                centered
                destroyOnClose
                aria-labelledby="edit-question-modal"
            >
                <EditQuestionForm question={question} onSubmit={onEditQuestion} />
            </Modal>

            <Modal
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                title="Delete Question?"
                centered
                destroyOnClose
                aria-labelledby="delete-question-modal"
                onOk={handleDeleteQuestion}
                okText="Confirm"
                maskClosable={false}
                closable={false}
                okButtonProps={{ danger: true }}
            >
                <p>
                    Are you sure you want to delete <b>{question.title}</b>?
                </p>
            </Modal>
        </>
    );
};
