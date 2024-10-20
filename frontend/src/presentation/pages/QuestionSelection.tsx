import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Spin, Button } from "antd";
import { QuestionList } from "../components/QuestionList";
import { QuestionDetail } from "../components/QuestionDetail";
import { LandingComponent } from "../components/LandingComponent";
import { Question } from "../../domain/entities/Question";
import { questionUseCases } from "../../domain/usecases/QuestionUseCases";
import styles from "./QuestionManagement.module.css";
import { ROUTES, ERRORS } from "presentation/utils/constants";
import { handleError } from "presentation/utils/errorHandler";
import { useParams, useSearchParams } from "react-router-dom";

const QuestionSelection: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const selectedQuestionCode = searchParams.get("code");

    const selectedQuestion: Question | undefined = questions.find((q) => q.code.toString() === selectedQuestionCode);
    const { roomId, matchUserId } = useParams<{ roomId: string; matchUserId: string }>(); // Correct params destructuring

    useEffect(() => {
        console.log("Room ID:", roomId);
        console.log("matchUserId ID:", matchUserId); // Logs matchUserId correctly
    }, [roomId, matchUserId]); // Added matchUserId as a dependency

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
                            isNarrow={selectedQuestion !== undefined}
                            questions={questions}
                            selectedQuestion={selectedQuestion}
                            onSelectQuestion={handleSelectQuestion}
                            isLoading={isLoading}
                            error={error}
                        />
                    </Col>
                    <Col span={16} className={styles.transitionCol}>
                        {isLoading ? (
                            <Spin size="large" />
                        ) : selectedQuestion ? (
                            <QuestionDetail question={selectedQuestion} isAdmin={false} matchUserId={matchUserId} />
                        ) : (
                            <LandingComponent isAdmin={false} matchUserId={matchUserId} />
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default QuestionSelection;
