import mongoose, { Schema, Types, Document } from 'mongoose';
import { Category as SharedCategory } from '@shared/types/Category';

export interface Category
  extends Omit<SharedCategory, '_id'>,
    Document {
  _id: Types.ObjectId;
}

const categorySchema: Schema<Category> = new Schema<Category>({
  name: { type: String, required: true, unique: true },
});

const categoryModel = mongoose.model<Category>(
  'category',
  categorySchema
);

export default categoryModel;
