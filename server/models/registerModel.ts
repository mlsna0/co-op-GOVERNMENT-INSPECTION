import mongoose from 'mongoose';

const registerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, required: true, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    address: String,
    provine : String,
    district : String,
    subDistrict : String,
    postcode : String,
    detail : String,
    profileImage: String, // เพิ่มฟิลด์สำหรับเก็บไฟล์โปรไฟล์
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

const RegisterModel = mongoose.model('RegisterModel', registerSchema);

export default RegisterModel;
