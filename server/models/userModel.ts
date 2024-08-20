import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

export interface User{
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
  }

const User = mongoose.model('User', userSchema);

export default User;
