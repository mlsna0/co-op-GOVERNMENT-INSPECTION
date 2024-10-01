import * as mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
    view_rank: String,
    view_first_name: String,
    view_last_name: String,
    signature: String,  // จัดเก็บลายเซ็นเป็นสตริง base64 หรือเส้นทางไปยังไฟล์ลายเซ็น

    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'document' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
});

const ViewModel = mongoose.model('inspector', viewSchema,'inspectors');
export default ViewModel;
