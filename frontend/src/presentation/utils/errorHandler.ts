import { AppError } from './errors';
import { ERRORS } from './constants';

export const handleError = (error: unknown, customMessage?: string): string => {
    if (error instanceof AppError) {
        return error.message;
    } else {
        console.log(error);
    }
    // console.error('Unhandled error: ', error);
    return customMessage || ERRORS.GENERAL_ERROR;
};
