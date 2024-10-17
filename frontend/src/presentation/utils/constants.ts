import { QuestionDifficulty } from "domain/entities/QuestionDifficulty";

export const ROUTES = {
    QUESTIONS: "Questions"
};

export const MESSAGES = {
    WORKING_AREA_TITLE: "Working Area",
    WORKING_AREA_DESCRIPTION: "This is where you'll work on the selected question.",
    SIGN_IN_PROMPT: "Already have an account? Sign in now!",
    SIGN_UP_PROMPT: "Don't have an account? Sign up now!"
};

export const HASH = {
    SEPARATOR: "/"
};

export const ERRORS = {
    QUESTION_TITLE_EMPTY: "Question title cannot be empty",
    QUESTION_DESCRIPTION_EMPTY: "Question description cannot be empty",
    QUESTION_DIFFICULTY_EMPTY: "Question must have a difficulty level",
    QUESTION_CATEGORY_EMPTY: "Question must have at least one category",
    QUESTION_NOT_FOUND: "Question not found",
    FAILED_TO_LOAD_QUESTIONS: "Failed to load questions. Please try again later.",
    FAILED_TO_LOAD_SELECTED_QUESTION: "Failed to load the selected question.",
    FAILED_TO_CREATE_QUESTION: "Failed to create the question. Please try again later.",
    FAILED_TO_UPDATE_QUESTION: "Failed to update the question. Please try again later.",
    FAILED_TO_DELETE_QUESTION: "Failed to delete the question. Please try again later.",
    USER_EMAIL_EMPTY: "Email cannot be empty",
    USER_USERNAME_EMPTY: "Username cannot be empty",
    USER_PASSWORD_NOT_STRONG_ENOUGH: "Password is not strong enough",
    GENERAL_ERROR: "An unexpected error occurred. Please try again later."
};

export const QUESTIONS_PAGE_TEXT = {
    LAST_SELECTED_QUESTION_KEY: "lastSelectedQuestionId",
    ADD_QUESTION: "Add a new question"
};

export const QUESTIONS_LIST_TEXT = {
    NO_QUESTIONS: "No Questions",
    NO_QUESTIONS_DESCRIPTION: "No questions match your filters."
};

export const QUESTIONS_FILTER_TEXT = {
    SELECT_DIFFICULTY: "Select Difficulty",
    SELECT_CATEGORIES: "Select Categories",
    SELECT_TITLE: "Search by title"
};

export const FILTER_DIFFICULTY_TEXT = {
    ALL: "All",
    EASY: "Easy" as QuestionDifficulty,
    MEDIUM: "Medium" as QuestionDifficulty,
    HARD: "Hard" as QuestionDifficulty
};

export const LANDING_CARD_TEXT = {
    WELCOME: "Welcome to the Question Workspace",
    INSTRUCTIONS: "Select a question from the list or add a new question to get started.",
    ADD_QUESTION: "Add a new question"
};

export const QUESTION_FORM_FIELDS = {
    FIELD_TITLE: { label: "Title", name: "title" },
    FIELD_DESCRIPTION: { label: "Description", name: "description" },
    FIELD_CATEGORIES: { label: "Categories", name: "categories" },
    FIELD_DIFFICULTY: { label: "Difficulty", name: "difficulty" },
    FIELD_URL: { label: "Reference URL", name: "url" }
};

export const UPDATE_PROFILE_FORM_FIELDS = {
    FIELD_USERNAME: { label: "Username", name: "username" },
    FIELD_EMAIL: { label: "Email", name: "email" },
    FIELD_PASSWORD: { label: "New Password", name: "password" },
    FIELD_CONFIRM_PASSWORD: { label: "Confirm New Password", name: "confirmPassword" }
};

export const SIGN_UP_FORM_FIELDS = {
    FIELD_EMAIL: { label: "Email", name: "email" },
    FIELD_USERNAME: { label: "Username", name: "username" },
    FIELD_PASSWORD: { label: "Password", name: "password" },
    FIELD_CONFIRM_PASSWORD: { label: "Confirm password", name: "confirmPassword" }
};
