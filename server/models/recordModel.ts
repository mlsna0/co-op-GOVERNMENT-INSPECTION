import * as mongoose from 'mongoose';
import viewSchema from './viewModel' //petch add this


const recordSchema = new mongoose.Schema({
    record_id: String,
    record_star_date: Date,
    record_end_date: Date,
    record_detail: String,
    record_location: String,
    record_topic: String
});

const recordModel = mongoose.model('recordModel', recordSchema);
// export interface AnnoucementModel {
//     record_id: String,   
//     record_star_date: Date,
//     record_end_date: Date,
//     record_detail: String,
//     record_location: String,
//     record_topic: String,   
//   }
export default recordModel;


// import { Schema, model, Document } from 'mongoose';

// interface recordMo extends Document {
//     record_star_date: Date,
//     record_end_date: Date,
//     record_detail: String,
//     record_location: String,
//     record_topic: String,   
 
// }

// const recordSchema = new Schema<recordMo>({
//     record_star_date: { type: Date, required: true },
//     record_end_date: { type: Date, required: true },
//     record_detail: { type: String, required: true },
//     record_location: { type: String, required: true },
//     record_topic: { type: String, required: true },
 
// });

// const record = model<recordMo>('record', recordSchema);
// export default record;
// export type { recordMo };

