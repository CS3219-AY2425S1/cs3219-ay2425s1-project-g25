import { ValidationError } from "../../presentation/utils/errors";
import { ERRORS } from "../../presentation/utils/constants";
import { IUserUpdateInput } from "domain/users/IUser";
import { isPasswordStrong } from "presentation/utils/formUtils";

export class UserValidator {
    static validateUserUpdateInput(userUpdateInput: IUserUpdateInput): void {
        const { email, username, password } = userUpdateInput;
        if (email !== undefined && email.trim() === "") {
            throw new ValidationError(ERRORS.USER_EMAIL_EMPTY);
        }
        if (username !== undefined && username.trim() === "") {
            throw new ValidationError(ERRORS.USER_USERNAME_EMPTY);
        }

        if (password !== undefined && !isPasswordStrong(password)) {
            throw new ValidationError(ERRORS.USER_PASSWORD_NOT_STRONG_ENOUGH);
        }
    }
}
