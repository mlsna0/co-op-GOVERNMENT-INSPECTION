import mongoose from 'mongoose';

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
    profileImage: String, // เพิ่มฟิลด์สำหรับเก็บไฟล์โปรไฟล์

   

});

const RegisterModel = mongoose.model('Employee', registerSchema);

export default RegisterModel;
