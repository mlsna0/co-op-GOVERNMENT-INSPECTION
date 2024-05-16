import * as mongoose from 'mongoose';
var Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
    Number_of_times: String,
    star_date: String,
    end_date: String,
    place: String,   
    Inspected_work:String,
    Rank_Position: String,
    name_lname:String,
});

const userModel = mongoose.model('userModel',   userSchema);
export interface AnnoucementModel {
   Number_of_times: String,
    star_date: String,
    end_date: String,
    place: String,
    Inspected_work:String,
    Rank_Position: String,
    name_lname:String,
  
  }
export default userModel;
