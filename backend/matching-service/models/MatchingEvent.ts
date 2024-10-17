import mongoose, { Schema, Document } from "mongoose";

export interface MatchingEvent extends Document {
    user1?: {
        username: string;
        email: string;
    };
    user2?: {
        username: string;
        email: string;
    };
    category?: string;
    difficulty?: string;
    matchedAt?: Date;
}

const matchingEventSchema: Schema = new Schema({
    user1: {
        username: { type: String, required: true },
        email: { type: String, required: true },
    },
    user2: {
        username: { type: String, required: true },
        email: { type: String, required: true },
    },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    matchedAt: { type: Date, default: Date.now },
});

const MatchingEventModel = mongoose.model<MatchingEvent>(
    "matchingEvent",
    matchingEventSchema
);

export default MatchingEventModel;
