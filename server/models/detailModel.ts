import * as mongoose from 'mongoose';

const dtSchema = new mongoose.Schema({
    DT_dt : String,

    RecordModelId: { type: mongoose.Schema.Types.ObjectId, ref: 'recordModel' }

})

const DTModel = mongoose.model('DTModel',dtSchema);
export default DTModel;