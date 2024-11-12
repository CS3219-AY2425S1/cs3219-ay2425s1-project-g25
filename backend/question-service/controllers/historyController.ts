import { Response, Request } from "express";
import historyEntryModel from "../models/HistoryEntry";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
};

export const getUserHistoryEntries = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    const historyEntries = await historyEntryModel.find({ userId }).populate({
      path: "question",
      populate: {
        path: "categories",
        model: "category",
      },
    });
    
    historyEntries.forEach(async (entry) => {
      if (entry.question === null) {
        await historyEntryModel.findByIdAndDelete({_id: entry._id});
      }
    })
    
    const historyViewModels = historyEntries
    .filter((entry) => !(entry.question === null))
    .map((entry) => {
      const attemptStartDate = new Date(entry.attemptStartedAt);
      const timeDiffMs = Date.now() - attemptStartDate.getTime();
      const isWithin24Hours = timeDiffMs < 86400000; // 1 Day; Same as ROOM_LIFESPAN in MatchingService. Can be different if desired.
      
      return {
        id: entry._id,
        key: entry._id,
        roomId: isWithin24Hours ? entry.roomId : null,
        attemptStartedAt: entry.attemptStartedAt.getTime(),
        lastAttemptSubmittedAt: entry.lastAttemptSubmittedAt.getTime(),
        title: entry.question.title,
        difficulty: entry.question.difficulty,
        topics: entry.question.categories.map((cat: any) => cat.name),
        description: entry.question.description,
        attemptCodes: entry.attemptCodes.filter((attemptCode) => attemptCode && attemptCode !== ""),
      };
    });
    res.status(200).json(historyViewModels);
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const createOrUpdateUserHistoryEntry = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    const { questionId, roomId, attemptStartedAt, attemptCompletedAt, collaboratorId, attemptCode, isInitial } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    const existingEntry = await historyEntryModel.findOne({ userId, roomId });

    if (!isInitial && existingEntry && attemptCode && attemptCode !== "") {
      existingEntry.question = questionId;
      existingEntry.attemptStartedAt = attemptStartedAt;
      existingEntry.lastAttemptSubmittedAt = attemptCompletedAt;
      existingEntry.collaboratorId = collaboratorId;
      existingEntry.attemptCodes.push(attemptCode);

      const updatedEntry = await existingEntry.save();

      return res.status(200).json(updatedEntry);
    } else if (!existingEntry) {
      try {
        const newHistoryEntry = new historyEntryModel({
          userId,
          question: questionId,
          roomId,
          attemptStartedAt,
          attemptCompletedAt,
          collaboratorId,
          attemptCodes: isInitial ? [attemptCode] : [],
        });

        const savedEntry = await newHistoryEntry.save();

        return res.status(201).json(savedEntry);
      } catch {
        return res.status(200).json("Attempt already exists.");
      }
    } else {
      return res.status(200).json("Attempt already exists.");
      // To reach here, this must be initial creation and there's an existing entry. No need to create new attempt.
    }
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const deleteUserHistoryEntry = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deletedEntry = await historyEntryModel.findOneAndDelete({ _id: id, userId });

    if (!deletedEntry) {
      return res.status(404).json({ message: "History entry not found" });
    }

    res.status(200).json({ message: "History entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const deleteUserHistoryEntries = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: '"ids" must be an array of history entry IDs.' });
    }

    const result = await historyEntryModel.deleteMany({ _id: { $in: ids }, userId });
    res.status(200).json({ message: `${result.deletedCount} history entries deleted.` });
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const deleteAllUserHistoryEntries = async (req: any, res: Response) => {
  try {
    const userId = req.userId;

    const result = await historyEntryModel.deleteMany({ userId });
    res.status(200).json({
      message: `${result.deletedCount} history entries deleted for user ${userId}.`,
    });
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};
