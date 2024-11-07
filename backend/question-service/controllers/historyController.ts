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
    const historyViewModels = historyEntries.map((entry) => {
      return {
        id: entry._id,
        key: entry._id,
        roomId: entry.roomId,
        attemptStartedAt: entry.attemptStartedAt.getTime(),
        attemptCompletedAt: entry.attemptCompletedAt.getTime(),
        title: entry.question.title,
        difficulty: entry.question.difficulty,
        topics: entry.question.categories.map((cat: any) => cat.name),
        attemptCodes: entry.attemptCodes,
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

    const { questionId, roomId, attemptStartedAt, attemptCompletedAt, collaboratorId, attemptCode } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    const existingEntry = await historyEntryModel.findOne({ userId, roomId });

    if (existingEntry) {
      existingEntry.question = questionId;
      existingEntry.attemptStartedAt = attemptStartedAt;
      existingEntry.attemptCompletedAt = attemptCompletedAt;
      existingEntry.collaboratorId = collaboratorId;
      existingEntry.attemptCodes.push(attemptCode);

      const updatedEntry = await existingEntry.save();

      return res.status(200).json(updatedEntry);
    } else {
      const newHistoryEntry = new historyEntryModel({
        userId,
        question: questionId,
        roomId,
        attemptStartedAt,
        attemptCompletedAt,
        collaboratorId,
        attemptCodes: [attemptCode],
      });

      const savedEntry = await newHistoryEntry.save();

      return res.status(201).json(savedEntry);
    }
  } catch (error) {
    return res.status(500).json({ error: getErrorMessage(error) });
  }
};

export const removeRoomIdPresence = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { roomId } = req.params;

    const existingEntries = await historyEntryModel.find({ roomId });
    const updatedEntries: string[] = [];

    existingEntries.forEach(async (entry) => {
      entry.roomId = "";
      await entry.save();
      updatedEntries.push(entry._id.toString());
    });

    return res.status(200).json({ updatedEntries });
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
