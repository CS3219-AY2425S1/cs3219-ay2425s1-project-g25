import mongoose, { Schema, Types, Document } from 'mongoose';
export interface Category extends Document {
  _id: Types.ObjectId;
  name: string;
}

const categorySchema: Schema<Category> = new Schema<Category>({
  name: { type: String, required: true, unique: true },
});

const categoryModel = mongoose.model<Category>(
  'category',
  categorySchema
);

export default categoryModel;
