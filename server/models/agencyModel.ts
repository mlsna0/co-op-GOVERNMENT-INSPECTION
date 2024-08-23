import mongoose, { Schema } from 'mongoose';

const agencySchema = new mongoose.Schema({
    agency_name: String,
    email: String,
    phone: String,
    address: String,
    province: String,
    amphure: String,
    tambon: String,
    postCode: String,
});


const Agency = mongoose.model('Agency', agencySchema);

export default Agency;
