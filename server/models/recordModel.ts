import * as mongoose from 'mongoose';
import viewSchema from './viewModel' //petch add this

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
    record_place: String
    //     record_data_: Buffer,
    //     record_contentType: String
    //   }  
    // ]
  });

const RecordModel = mongoose.model('RecordModel', recordSchema);
export default RecordModel;

