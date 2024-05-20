import { Schema, model, Document } from 'mongoose';

interface view extends Document {
view_rank: string;
view_full_name: string;
 
}

const viewSchema = new Schema<view>({
view_rank: { type: String, required: true },
view_full_name: { type: String, required: true },
 
});

const viewMo = model<view>('viewMo', viewSchema);
export default viewMo;
export type { view };
