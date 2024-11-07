import mongoose, { Schema, Types } from 'mongoose';
import { Question } from './Question';

export interface HistoryEntry extends mongoose.Document {
  _id: Types.ObjectId;
  userId: string;
  question: Question;
  roomId: string; // Note: This should not be used to retrieve the room from matching service! This is only here to serve as a uniqueness check for updating attempt information!
  attemptStartedAt: Date;
  attemptCompletedAt: Date;
  collaboratorId: string;
  attemptCodes: string[];
}

const historyEntrySchema: Schema = new Schema<HistoryEntry>({
  userId: { type: String, required: true },
  question: { type: Schema.Types.ObjectId, ref: 'question', required: true },
  roomId: { type: String, required: true, unique: false },
  attemptStartedAt: { type: Date, required: true, default: Date.now() },
  attemptCompletedAt: { type: Date, required: true, default: Date.now() },
  collaboratorId: { type: String, required: true },
  attemptCodes: [{ type: String, required: true }],
});

const historyEntryModel = mongoose.model<HistoryEntry>('historyEntry', historyEntrySchema);
export default historyEntryModel;
