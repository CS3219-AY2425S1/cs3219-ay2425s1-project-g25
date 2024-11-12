import mongoose, { Schema, Types } from "mongoose";

export interface Room extends mongoose.Document {
    _id: Types.ObjectId;
    participants: string[];
    category: string;
    difficulty: string;
    roomId: string;
    questionId: string;
    createdAt: Date;
}


const roomSchema: Schema<Room> = new mongoose.Schema<Room>({
    participants: [{ type: String }],
    category: { type: String, default: 'Any' },
    difficulty: { type: String, default: 'Any' },
    roomId: { type: String, required: true },
    questionId : { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const roomModel = mongoose.model<Room>('Room', roomSchema);

export default roomModel;
