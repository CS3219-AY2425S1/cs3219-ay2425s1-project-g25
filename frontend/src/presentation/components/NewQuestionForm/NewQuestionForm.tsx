/* eslint-disable no-template-curly-in-string */
import React, { useState, useEffect } from "react";
import { Input, Form, Select, Row, Col, Button } from "antd";
import styles from "./NewQuestionForm.module.css";
import { IQuestionInput } from "domain/repositories/IQuestionRepository";
import { QUESTION_FORM_FIELDS } from "presentation/utils/constants";
import { difficultyOptions, initialQuestionInput } from "presentation/utils/QuestionUtils";
import { questionUseCases } from "domain/usecases/QuestionUseCases";
import { toast } from "react-toastify";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";
import { Category } from "domain/entities/Category";
import { Question } from "domain/entities/Question";
import { ReactMarkdown } from "../common/ReactMarkdown";
import axios from "axios";

interface NewQuestionFormProps {
    onSubmit?: (createdQuestion: Question) => void;
}

export const NewQuestionForm: React.FC<NewQuestionFormProps> = ({ onSubmit }) => {
    const [form] = Form.useForm();
    const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
    const [description, setDescription] = useState<string>(initialQuestionInput?.description)

    const validateMessages = {
        required: "${label} is required",
        whitespace: "${label} is required"
    };

    const { FIELD_TITLE, FIELD_DIFFICULTY, FIELD_DESCRIPTION, FIELD_CATEGORIES, FIELD_URL } = QUESTION_FORM_FIELDS;

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const fetchedCategories: Category[] = await categoryUseCases.getAllCategories();
                const options = fetchedCategories.map((category) => ({
                    value: category._id,
                    label: category.name
                }));
                setCategoryOptions(options);
                setCategories(fetchedCategories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
                toast.error("Failed to load categories.");
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    async function handleSubmit(question: IQuestionInput) {
        try {
            const selectedCategoryIds = form.getFieldValue("categories");

            const selectedCategoryNames = categories
                .filter((category) => selectedCategoryIds.includes(category._id))
                .map((category) => category.name);

            const questionWithDescription = {
                ...question,
                categories: selectedCategoryNames
            };

            const data = await questionUseCases.createQuestion(questionWithDescription);
            const newQuestion = data?.question;
            toast.success(data?.message);
            onSubmit?.(newQuestion);
            form.resetFields();
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Unable to create question");
            }
        }
    }

    return (
        <div>
            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialQuestionInput}
                validateMessages={validateMessages}
                scrollToFirstError
                form={form}
            >
                <Row gutter={16} className={styles.formRow}>
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
                            rules={[{ required: true }]}
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
                            rules={[{ required: true }]}
                        >
                            <Select
                                placeholder={FIELD_CATEGORIES.label}
                                allowClear
                                mode="multiple"
                                options={categoryOptions}
                                loading={loadingCategories}
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
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Create
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};
