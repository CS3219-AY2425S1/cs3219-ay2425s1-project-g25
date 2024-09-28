import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Button, Modal } from "antd";
import { QuestionList } from "../components/QuestionList";
import { QuestionDetail } from "../components/QuestionDetail";
import { LandingComponent } from "../components/LandingComponent";
import { NewQuestionForm } from "../components/NewQuestionForm/NewQuestionForm";
import { Question } from "../../domain/entities/Question";
import { QUESTIONS_PAGE_TEXT } from "presentation/utils/constants";
import { questionUseCases } from "../../domain/usecases/QuestionUseCases";
import styles from "./QuestionsPage.module.css";
import { ROUTES, ERRORS } from "presentation/utils/constants";
import { handleError } from "presentation/utils/errorHandler";
import { AddQuestionButton } from "presentation/components/buttons/AddQuestionButton";
import { useSearchParams } from "react-router-dom";

const QuestionsPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const fetchedQuestions = await questionUseCases.getAllQuestions();
                setQuestions(fetchedQuestions);
            } catch (err) {
                setError(handleError(err, ERRORS.FAILED_TO_LOAD_QUESTIONS));
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const handleSelectQuestion = (question: Question) => {
        setSelectedQuestion(question);
        setSearchParams({ code: question.code });
    };

    const handleBreadcrumbClick = (item: string) => () => {
        if (item === ROUTES.QUESTIONS) {
            setSearchParams({});
            setSelectedQuestion(null);
        }
    };

    const handleAddQuestion = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const onCreateQuestion = (createdQuestion: Question) => {
        handleCloseModal();
        setQuestions((questions) => [...questions, createdQuestion]);
        setSearchParams({ code: createdQuestion.code });
        setSelectedQuestion(createdQuestion);
    };

    const onEditQuestion = (updatedQuestion: Question) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q))
        );
        setSearchParams({ code: updatedQuestion.code });
        setSelectedQuestion(updatedQuestion);
    };

    const onDeleteQuestion = (deletedQuestion: Question) => {
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q._id !== deletedQuestion._id));
        setSearchParams({});
        setSelectedQuestion(null);
    };

    const renderBreadcrumb = () => {
        const breadcrumbItems = [
            {
                title: (
                    <Button type="link" onClick={handleBreadcrumbClick(ROUTES.QUESTIONS)}>
                        {ROUTES.QUESTIONS}
                    </Button>
                )
            }
        ];

        if (selectedQuestion) {
            breadcrumbItems.push({
                title: (
                    <Button type="link" disabled>
                        {selectedQuestion.title}
                    </Button>
                )
            });
        }

        return (
            <div className={styles.breadcrumb}>
                <Breadcrumb items={breadcrumbItems} />
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {renderBreadcrumb()}
            <div className={styles.scrollContainer}>
                <Row className={styles.contentRow} gutter={32}>
                    <Col span={8} className={styles.transitionCol}>
                        <QuestionList
                            isNarrow={selectedQuestion !== null}
                            questions={questions}
                            selectedQuestion={selectedQuestion}
                            onSelectQuestion={handleSelectQuestion}
                            isLoading={isLoading}
                            error={error}
                        />
                        <div className={styles.addButtonWrapper}>
                            <AddQuestionButton label={QUESTIONS_PAGE_TEXT.ADD_QUESTION} onClick={handleAddQuestion} />
                        </div>
                    </Col>
                    <Col span={16} className={styles.transitionCol}>
                        {selectedQuestion ? (
                            <QuestionDetail
                                question={selectedQuestion}
                                onEdit={onEditQuestion}
                                onDelete={onDeleteQuestion}
                            />
                        ) : (
                            <LandingComponent onAddQuestion={handleAddQuestion} />
                        )}
                    </Col>
                </Row>
            </div>

            <Modal
                title="Add New Question"
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={"90vw"}
                centered
            >
                <NewQuestionForm onSubmit={onCreateQuestion} />
            </Modal>
        </div>
    );
};

export default QuestionsPage;
