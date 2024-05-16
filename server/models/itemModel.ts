import { Schema, model, Document } from 'mongoose';

interface IItem extends Document {
  name: string;
  country: string;
  city: string;
  salary: number;
}

const itemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  salary: { type: Number, required: true }
});

const Item = model<IItem>('Items', itemSchema);
export default Item;
export type { IItem };
