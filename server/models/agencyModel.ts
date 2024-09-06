// import mongoose, { Schema } from 'mongoose';
import * as mongoose from 'mongoose';


const agencySchema = new mongoose.Schema({
  agency_name: String,
  division: String,
  email: String,
  phone: String,
  address: String,
  province: String,
  amphure: String,
  tambon: String,
  postCode: String,
});
export interface agencyModel{
  agency_name: String,
  email: String,
  phone: String,
  address: String,
  province: String,
  amphure: String,
  tambon: String,
  postCode: String,
}
const Agency = mongoose.model('Agency', agencySchema ,'agencies');

export default Agency;
