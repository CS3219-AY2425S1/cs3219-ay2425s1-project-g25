import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    participants: [{ userId: String }],
    category: { type: String, default: 'Any' },
    difficulty: { type: String, default: 'Any' },
    createdAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
