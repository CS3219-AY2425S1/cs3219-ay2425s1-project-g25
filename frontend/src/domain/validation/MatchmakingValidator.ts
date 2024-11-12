import { ValidationError } from "../../presentation/utils/errors";
import { MATCHING_ERRORS } from "../../presentation/utils/constants";
import { Category } from "domain/entities/Category";

interface IMatchmakingInput {
    username: string | undefined;
    email: string | undefined;
    selectedCategories: Category[] | null;
    selectedDifficulty: string | null;
}

interface ValidatedMatchmakingInput {
    username: string;
    email: string;
    selectedCategories: Category[];
    selectedDifficulty: string;
}

export class MatchmakingValidator {
    static validateAndCorrectMatchmakingInput(matchmakingInput: IMatchmakingInput): ValidatedMatchmakingInput {
        let { username, email, selectedCategories, selectedDifficulty } = matchmakingInput;

        username = (username ?? "").trim();
        email = (email ?? "").trim();

        if (username === "") {
            throw new ValidationError(MATCHING_ERRORS.USER_USERNAME_EMPTY);
        }

        if (email === "") {
            throw new ValidationError(MATCHING_ERRORS.USER_EMAIL_EMPTY);
        }

        selectedCategories = selectedCategories && selectedCategories.length > 0
            ? selectedCategories
            : [{ name: "all" } as Category];

        selectedDifficulty = (selectedDifficulty ?? "").trim();
        if (selectedDifficulty === "") {
            throw new ValidationError(MATCHING_ERRORS.NO_DIFFICULTY_SELECTED);
        }

        selectedCategories = selectedCategories.map(category => ({
            ...category,
            name: category.name.toLowerCase()
        }));
        selectedDifficulty = selectedDifficulty.toLowerCase();

        return {
            username,
            email,
            selectedCategories,
            selectedDifficulty
        };
    }
}
