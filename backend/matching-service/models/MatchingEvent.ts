import mongoose, { Schema, Document, Types } from "mongoose";

export interface MatchingEvent extends Document {
    _id: Types.ObjectId;
    user1?: {
        userId: string;
    };
    user2?: {
        userId: string;
    };
    category?: string;
    difficulty?: string;
    matchedAt?: Date;
}

const matchingEventSchema: Schema = new Schema({
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    matchedAt: { type: Date, default: Date.now },
});

const MatchingEventModel = mongoose.model<MatchingEvent>(
    "matchingEvent",
    matchingEventSchema
);

export default MatchingEventModel;
