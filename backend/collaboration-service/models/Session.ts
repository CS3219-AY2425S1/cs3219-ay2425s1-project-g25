import mongoose, { Types } from "mongoose";

const sessionSchema = new mongoose.Schema({
    matchId: { type: String, required: true },
    sessionId: { type: String, required: true },
    codeContent: { type: String, default: "" },
    lastUpdated: { type: Date, default: Date.now }
});

const Session = mongoose.model('session', sessionSchema);

export default Session;
