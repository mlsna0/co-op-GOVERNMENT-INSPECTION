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
    // record_postcode: String,
    // record_prvinece: String,
    // record_district: String,
    // record_sub_district: String,
    // record_address: String,
    record_place: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
  
    //     record_data_: Buffer,
    //     record_contentType: String
    //   }  
    // ]
  });
<<<<<<< HEAD
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
    viewData: {
      view_rank: string;
      view_full_name: string;
    };
    note: string;
  }
=======
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
  viewData: {
    view_rank: string;
    view_full_name: string;
  };
  note: string;
}
>>>>>>> d1cf44cb709313ef15333279675601d3b6b35572
const RecordModel = mongoose.model('RecordModel', recordSchema);
export default RecordModel;

