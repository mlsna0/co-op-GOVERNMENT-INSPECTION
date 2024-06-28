import mongoose from 'mongoose';

const registerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmpassword: { type: String, required: true },
    phone: String,
    role: { type: String, required: true, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

const RegisterModel = mongoose.model('RegisterModel', registerSchema);

export default RegisterModel;
