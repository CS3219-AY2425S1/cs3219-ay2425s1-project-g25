import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Button, Modal, Spin } from "antd";
import { QuestionList } from "../../../components/questions/QuestionList/QuestionList";
import { QuestionDetail } from "presentation/components/questions/QuestionDetail/QuestionDetail";
import { LandingComponent } from "../../../components/home/LandingComponent";
import { NewQuestionForm } from "presentation/components/questions/NewQuestionForm/NewQuestionForm";
import { Question } from "../../../../domain/entities/Question";
import { QUESTIONS_PAGE_TEXT } from "presentation/utils/constants";
import { questionUseCases } from "../../../../domain/usecases/QuestionUseCases";
import styles from "./QuestionManagement.module.css";
import { ROUTES, ERRORS } from "presentation/utils/constants";
import { handleError } from "presentation/utils/errorHandler";
import { AddQuestionButton } from "presentation/components/common/buttons/AddQuestionButton";
import { useSearchParams } from "react-router-dom";

const QuestionManagement: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const selectedQuestionCode = searchParams.get("code");

    const selectedQuestion: Question | undefined = questions.find((q) => q.code.toString() === selectedQuestionCode);

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
        setSearchParams({ code: question.code });
    };

    const handleBreadcrumbClick = (item: string) => () => {
        if (item === ROUTES.QUESTIONS) {
            setSearchParams({});
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
    };

    const onEditQuestion = (updatedQuestion: Question) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q))
        );
        setSearchParams({ code: updatedQuestion.code });
    };

    const onDeleteQuestion = (deletedQuestion: Question) => {
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q._id !== deletedQuestion._id));
        setSearchParams({});
    };

    const handleQuestionsUpdated = (updatedQuestions: Question[]) => {
        setQuestions(updatedQuestions);
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
                            isEditMode={true}
                            isNarrow={selectedQuestion !== undefined}
                            questions={questions}
                            selectedQuestion={selectedQuestion}
                            onSelectQuestion={handleSelectQuestion}
                            isLoading={isLoading}
                            error={error}
                            onQuestionsUpdated={handleQuestionsUpdated}
                        />
                        <div className={styles.addButtonWrapper}>
                            <AddQuestionButton label={QUESTIONS_PAGE_TEXT.ADD_QUESTION} onClick={handleAddQuestion} />
                        </div>
                    </Col>
                    <Col span={16} className={styles.transitionCol}>
                        {isLoading ? (
                            <Spin size="large" />
                        ) : selectedQuestion ? (
                            <QuestionDetail
                                question={selectedQuestion}
                                onEdit={onEditQuestion}
                                onDelete={onDeleteQuestion}
                                isAdmin={true}
                            />
                        ) : (
                            <LandingComponent onAddQuestion={handleAddQuestion} isAdmin={true} />
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

export default QuestionManagement;
