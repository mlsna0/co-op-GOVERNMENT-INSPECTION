import * as mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    record_id: String,
    record_star_date: Date,
    record_end_date: Date,
    record_detail: String,
    record_location: String,
    record_topic: String,
    record_content: String,
    // pdfs: [
    //   {
    record_filename: String,
    record_provine: String,
    // record_postcode: String,
    // record_prvinece: String,
    // record_district: String,
    // record_sub_district: String,
    // record_address: String,
    record_place: String,
    createdDate: String, // เพิ่มฟิลด์สำหรับเก็บวันที่
    createdTime: String, // เพิ่มฟิลด์สำหรับเก็บเวลา
    status: String,
    record_qrcode: String,
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  
    //     record_data_: Buffer,
    //     record_contentType: String
    //   }  
    // ]
  });
export interface RecordModel {
  id: number | null;
  times: number | null;
  startDate: Date; //petch ปรับเปลี่ยน จาก string เป็น date
  endDate: Date; //petch ปรับเปลี่ยน จาก string เป็น date
  location: string;
  task: string;
  rank: string;
  fullName: string;
  details: string;
  qrcode: String,
  viewData: {
    view_rank: string;
    view_full_name: string;
  };
  note: string;
}
const RecordModel = mongoose.model('document', recordSchema,'documents');
export default RecordModel;

