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
    _id?:string; // _id จาก MongoDB จะถูกใช้เมื่อมีการบันทึกข้อมูลแล้ว
    password?: string; // password ที่ต้องมี
    role?: 'user' | 'admin' | 'superadmin'; // ค่า role ตาม schema
    isActive?: boolean; // ค่าตาม schema
    employeeId?: string; // Reference ไปที่ Employee
    resetPasswordToken?: string; // ค่าตาม schema
    resetPasswordExpires?: Date; // ค่าตาม schema

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

const User = mongoose.model('User', userSchema,'users');

export default User;
