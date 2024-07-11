import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
});

const User = mongoose.model('User', userSchema);

export default User;
