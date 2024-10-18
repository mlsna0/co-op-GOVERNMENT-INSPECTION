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
  isActive: { type: Boolean, default: true },
});
export interface agencyModel{
  _id?: string; // เพิ่มฟิลด์ _idx
  agency_name: string,
  email: string,
  phone: string,
  address: string,
  province: string,
  amphure: string,
  tambon: string,
  postCode: string,
}
const Agency = mongoose.model('Agency', agencySchema ,'agencies');

export default Agency;
