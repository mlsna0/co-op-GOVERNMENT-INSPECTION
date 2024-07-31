import mongoose, { Schema } from 'mongoose';


const timeStampSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true } // ฟิลด์ employeeId
});

const TimeStamp = mongoose.model('TimeStamp', timeStampSchema);

export default TimeStamp;
