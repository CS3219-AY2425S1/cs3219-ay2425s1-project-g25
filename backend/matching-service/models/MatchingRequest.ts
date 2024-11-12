import mongoose, { Schema, Types } from "mongoose";

export interface MatchingRequest extends mongoose.Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    category: string;
    difficulty: string;
    socketId: string;
    requestedAt: Date;
}

const matchingRequestSchema: Schema<MatchingRequest> = new Schema<MatchingRequest>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    socketId: { type: String, required: true },
    requestedAt: { type: Date, required: true, default: Date.now },
});

const matchingRequestModel = mongoose.model<MatchingRequest>(
    "matchingRequest",
    matchingRequestSchema
);
export default matchingRequestModel;
