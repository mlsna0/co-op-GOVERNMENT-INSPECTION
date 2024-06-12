
import * as mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    note: String,
   

    RecordModelId: { type: mongoose.Schema.Types.ObjectId, ref: 'recordModel' }
});

const noteModel = mongoose.model('noteModel', noteSchema);

export default noteModel;
