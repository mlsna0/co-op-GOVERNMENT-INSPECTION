import * as mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  times: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  task: { type: String, required: true },
  rank: { type: String, required: true },
  fullName: { type: String, required: true },
  details: { type: String, required: true },
  viewData: { type: mongoose.Schema.Types.ObjectId, ref: 'ViewModel' }
});

const Items = mongoose.model('Items', itemSchema);
export interface Items {
  id: number | null;
  times: number | null;
  startDate: Date; //petch ปรับเปลี่ยน จาก string เป็น date
  endDate: Date; //petch ปรับเปลี่ยน จาก string เป็น date
  location: string;
  task: string;
  rank: string;
  fullName: string;
  details: string;
  viewData: {
    view_rank: string;
    view_full_name: string;
  };
  
}

export default Items;
