/* eslint-disable no-template-curly-in-string */
import React, { useState, useEffect } from "react";
import { Input, Form, Select, Row, Col, Button, Spin, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import styles from "../NewQuestionForm/NewQuestionForm.module.css";
import { Question } from "domain/entities/Question";
import { IQuestionUpdateInput } from "domain/repositories/IQuestionRepository";
import { QUESTION_FORM_FIELDS } from "presentation/utils/constants";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";
import { toast } from "react-toastify";
import { Category } from "domain/entities/Category";
import { questionUseCases } from "domain/usecases/QuestionUseCases";
import { difficultyOptions } from "presentation/utils/QuestionUtils";
import { ReactMarkdown } from "../common/ReactMarkdown";
import axios from "axios";
import { validateMessages } from "presentation/utils/formUtils";

interface EditQuestionFormProps {
    question: Question;
    onSubmit?: (updatedQuestion: Question) => void;
}

export const EditQuestionForm: React.FC<EditQuestionFormProps> = ({ question, onSubmit }) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [description, setDescription] = useState<string>(question.description);

    const { code: _, categories: questionCategories, ...questionUpdateInput } = question;

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const fetchedCategories: Category[] = await categoryUseCases.getAllCategories();

                const validCategoryIds = fetchedCategories.map((cat) => cat._id);

                const filteredQuestionCategories = questionCategories.filter((cat) =>
                    validCategoryIds.includes(cat._id)
                );

                setCategories(fetchedCategories);
                form.setFieldsValue({
                    categories: filteredQuestionCategories.map((cat) => cat._id)
                });
            } catch (error) {
                const message = (error as Error).message || "Failed to fetch categories";
                setCategoriesError(message);
                toast.error(message);
                console.error("Failed to fetch categories:", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [questionCategories, form]);

    const { FIELD_TITLE, FIELD_DIFFICULTY, FIELD_DESCRIPTION, FIELD_CATEGORIES, FIELD_URL } = QUESTION_FORM_FIELDS;

    async function handleSubmit(questionUpdate: IQuestionUpdateInput) {
        for (const field in questionUpdate) {
            if (questionUpdate[field as keyof IQuestionUpdateInput] === question[field as keyof Question]) {
                delete questionUpdate[field as keyof IQuestionUpdateInput];
            }
        }

        try {
            const selectedCategoryIds = form.getFieldValue("categories") as string[] | undefined;
            const isCategoriesUpdated =
                selectedCategoryIds &&
                (selectedCategoryIds.length !== question.categories.length ||
                    !selectedCategoryIds.every((cid: string) =>
                        question.categories.some((category) => category._id === cid)
                    ));
            if (isCategoriesUpdated && selectedCategoryIds) {
                const selectedCategoryNames = categories
                    .filter((category) => selectedCategoryIds.includes(category._id))
                    .map((category) => category.name);

                questionUpdate.categories = selectedCategoryNames;
            } else {
                delete questionUpdate.categories;
            }

            const data = await questionUseCases.updateQuestion(question._id, questionUpdate);
            toast.success(`Question "${question.title}" updated successfully!`);
            onSubmit?.(data?.updatedQuestion);
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Unable to edit question");
            }
        }
    }

    const categoryOptions = categories.map((category) => ({
        label: category.name,
        value: category._id
    }));

    return (
        <div className={styles.questionForm}>
            {isLoadingCategories ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            ) : categoriesError ? (
                <Alert message="Error" description={categoriesError} type="error" showIcon />
            ) : (
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        ...questionUpdateInput
                    }}
                    validateMessages={validateMessages}
                    scrollToFirstError
                    form={form}
                >
                    <Row gutter={16}>
                        <Col span={20}>
                            <Form.Item
                                label={FIELD_TITLE.label}
                                name={FIELD_TITLE.name}
                                rules={[{ required: true, whitespace: true }]}
                                labelAlign="right"
                            >
                                <Input placeholder={FIELD_TITLE.label} />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item
                                label={FIELD_DIFFICULTY.label}
                                name={FIELD_DIFFICULTY.name}
                                rules={[
                                    {
                                        required: true
                                    }
                                ]}
                            >
                                <Select placeholder={FIELD_DIFFICULTY.label} options={difficultyOptions} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                label={FIELD_CATEGORIES.label}
                                name={FIELD_CATEGORIES.name}
                                rules={[
                                    {
                                        required: true
                                    }
                                ]}
                            >
                                <Select
                                    placeholder={FIELD_CATEGORIES.label}
                                    allowClear
                                    mode="multiple"
                                    options={categoryOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={FIELD_URL.label} name={FIELD_URL.name}>
                                <Input type="text" placeholder={FIELD_URL.label} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Form.Item
                                label={FIELD_DESCRIPTION.label}
                                name={FIELD_DESCRIPTION.name}
                                rules={[{ required: true, whitespace: true }]}
                            >
                                <ReactMarkdown
                                    value={description}
                                    onChange={(description) => setDescription(description || "")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit">
                        Save
                    </Button>
                </Form>
            )}
        </div>
    );
};
