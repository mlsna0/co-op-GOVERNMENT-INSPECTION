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
    timestamps: [{ type: Schema.Types.ObjectId, ref: 'TimeStamp' }] // ฟิลด์ timestamps
});

export interface registerModel{
    firstname: string;
    lastname: string;
    organization: string;
    bearing: string;
    email: string;
    confirmpassword: string;
    phone: string;
    address: string;
    province: string;
    amphure: string;
    tambon: string;
    postCode: string;
    detail: string;
    profileImage: string;
    timestamps: mongoose.Types.ObjectId[]; // ฟิลด์ timestamps
  }

const RegisterModel = mongoose.model('Employee', registerSchema);

export default RegisterModel;
