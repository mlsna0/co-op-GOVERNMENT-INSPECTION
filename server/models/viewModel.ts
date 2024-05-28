import * as mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
    record_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RecordModel' },
  view_full_name: [
    {
      rank: { type: String, required: true },
      fullname: { type: String, required: true }
    }
  ]
});

viewSchema.virtual("recordModels", {
  ref: 'RecordModel',
  localField: 'record_id',
  foreignField: '_id'
});

const ViewModel = mongoose.model('ViewModel', viewSchema);
export default ViewModel;
