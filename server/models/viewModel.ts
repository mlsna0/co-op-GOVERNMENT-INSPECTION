import * as mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
    view_rank: String,
    view_first_name: String,
    view_last_name: String,
<<<<<<< HEAD
=======

>>>>>>> b28fa3b0e03f46da46dbd655596671f69e42a518

    RecordModelId: { type: mongoose.Schema.Types.ObjectId, ref: 'recordModel' }
});

const ViewModel = mongoose.model('ViewModel', viewSchema);
export default ViewModel;
