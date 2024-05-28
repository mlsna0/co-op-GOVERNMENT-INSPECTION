import * as mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  record_id: { type: String, required: true },
  record_start_date: { type: Date, required: true },
  record_end_date: { type: Date, required: true },
  record_detail: { type: String, required: true },
  record_location: { type: String, required: true },
  record_topic: { type: String, required: true },
  view_full_name: [
    {
      rank: { type: String, required: true },
      fullname: { type: String, required: true }
    }
],
viewModelId: { type: mongoose.Schema.Types.ObjectId, ref: 'ViewModel' }
});

const RecordModel = mongoose.model('RecordModel', recordSchema);
export default RecordModel;
