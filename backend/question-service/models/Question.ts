import mongoose, { Schema, Types } from 'mongoose';

export interface Question extends mongoose.Document {
  _id: Types.ObjectId;
  code: number;
  title: string;
  description: string;
  difficulty: string;
  categories: Types.ObjectId[];
  url?: string;
}

const questionSchema: Schema = new Schema<Question>({
  code: { type: Number, required: true, unique: true },
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true },
  categories: [{ type: Types.ObjectId, ref: 'category', required: true }],
  url: { type: String, required: false },
});

const questionModel = mongoose.model<Question>('question', questionSchema);
export default questionModel;
