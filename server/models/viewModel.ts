import * as mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
    view_rank: String,
    view_first_name: String,
    view_last_name: String,


    RecordModelId: { type: mongoose.Schema.Types.ObjectId, ref: 'recordModel' }
});

const ViewModel = mongoose.model('ViewModel', viewSchema);
export default ViewModel;
