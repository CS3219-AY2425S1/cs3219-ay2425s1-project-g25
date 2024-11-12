export class AppError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export class QuestionError extends AppError {
    constructor(message: string) {
        super(message);
        this.name = 'QuestionError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}
