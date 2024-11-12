import { historyRepository } from "data/repositories/HistoryRepositoryImpl";
import { HistoryEntry } from "domain/entities/HistoryEntry";
import { IHistoryRepository } from "domain/repositories/IHistoryRepository";

export class HistoryUseCases {
    constructor(private historyRepository: IHistoryRepository) {}

    /**
     * Retrieves all history entries of the logged in user.
     * @returns Promise resolving to an array of HistoryEntry objects.
     */
    async getAllUserHistories(): Promise<HistoryEntry[]> {
        const allHistories = this.historyRepository.getAllUserHistories();
		return allHistories;
    }

    /**
     * Creates a new User History Entry.
     * (Note that just roomId isn't enough because the collaborator will also have a very similar History Entry)
     * @returns Promise resolving when the history has been successfully created.
     */
    async createUserHistory(questionId: string, roomId: string, attemptStartedAt: string, attemptCompletedAt: string, collaboratorId: string, attemptCode: string): Promise<void> {
        if (!questionId || questionId.trim() === ""
        || !roomId || roomId.trim() === "" 
        || !attemptStartedAt || attemptStartedAt.trim() === "" 
        || !attemptCompletedAt || attemptCompletedAt.trim() === "" 
        || !collaboratorId || collaboratorId.trim() === "") {
            throw new Error("Missing Attempt Details");
        }
        await this.historyRepository.createOrUpdateUserHistory(questionId, roomId, attemptStartedAt, attemptCompletedAt, collaboratorId, attemptCode, true);
    }

    /**
     * Creates a new User History Entry. If there already exists a History Entry with the same userId (obtained in
     * backend via JWT token and not passed here) and roomId, update the existing one instead. 
     * (Note that just roomId isn't enough because the collaborator will also have a very similar History Entry)
     * @returns Promise resolving when the history has been successfully created.
     */
    async updateUserHistory(questionId: string, roomId: string, attemptStartedAt: string, attemptCompletedAt: string, collaboratorId: string, attemptCode: string): Promise<void> {
        if (!questionId || questionId.trim() === ""
        || !roomId || roomId.trim() === "" 
        || !attemptStartedAt || attemptStartedAt.trim() === "" 
        || !attemptCompletedAt || attemptCompletedAt.trim() === "" 
        || !collaboratorId || collaboratorId.trim() === "") {
            throw new Error("Missing Attempt Details");
        }
        await this.historyRepository.createOrUpdateUserHistory(questionId, roomId, attemptStartedAt, attemptCompletedAt, collaboratorId, attemptCode, false);
    }

    /**
     * Deletes histories by their unique _id.
     * @param selectedHistoryIds - The unique identifiers of the histories to delete.
     * @returns Promise resolving when the histories are successfully deleted.
     * @throws Error if selectedHistoryIds is of length 0 or contains an empty _id.
     */
    async deleteSelectedUserHistories(selectedHistoryIds: string[]): Promise<void> {
        if (selectedHistoryIds.length === 0 || selectedHistoryIds.find((_id) => (!_id || _id.trim() === ""))) {
            throw new Error("History ID must be provided");
        }
        await this.historyRepository.deleteSelectedUserHistories(selectedHistoryIds);
    }

    /**
     * Deletes all histories owned by the logged in user. Requires user to be logged in
     * with valid JWT token registered.
     * @returns Promise resolving when the histories are successfully deleted.
     */
    async deleteAllUserHistories(): Promise<void> {
        await this.historyRepository.deleteAllUserHistories();
    }
}

export const historyUseCases = new HistoryUseCases(historyRepository);
