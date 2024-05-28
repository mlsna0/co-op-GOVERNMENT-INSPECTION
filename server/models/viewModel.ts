// import { Schema, model, Document } from 'mongoose';

// interface view extends Document {
// view_rank: string;
// view_full_name: string;
 
// }

// const viewSchema = new Schema<view>({
// view_rank: { type: String, required: true },
// view_full_name: { type: String, required: true },
 
// });

// const viewMo = model<view>('viewMo', viewSchema);
// export default viewMo;
// export type { view };


import * as mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({

    view_rank: String,
    view_full_name: String
});

viewSchema.virtual("recordModels",{
    ref: 'recordModels',
    localField: '_id',
    foreignField: 'viewMedelId'
})

const ViewModel = mongoose.model('ViewModel', viewSchema);

export default ViewModel;
