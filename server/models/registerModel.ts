import mongoose, { Schema } from 'mongoose';

const registerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    organization: String,
    bearing: String,

    // email: { type: String, required: true, unique: true },
    // password: { type: String, required: true },
    email: String,
    // password: String,
    confirmpassword: String,
    phone: String,
    address: String,
    province: String,
    amphure: String,
    tambon: String,
    postCode: String,
    detail: String,
    profileImage: String, 
    timestamps: [{ type: Schema.Types.ObjectId, ref: 'TimeStamp' }] ,// ฟิลด์ timestamps
    agencies: {type: Schema.Types.ObjectId, ref: 'Agency'}
});

export interface registerModel{
    firstname: string;
    lastname: string;
    organization: string;
    bearing: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    amphure: string;
    tambon: string;
    postCode: string;
    detail: string;
    profileImage: string;
    agency: string; 
  }

const RegisterModel = mongoose.model('Employee', registerSchema, 'employees');

export default RegisterModel;
