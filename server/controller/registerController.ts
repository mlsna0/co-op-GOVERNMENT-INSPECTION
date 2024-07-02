import RegisterModel from '../models/registerModel';
import BaseCtrl from './base';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

class RegisterModelCtrl extends BaseCtrl {
    model = RegisterModel;

    create = async (req, res) => {
        try {
            const { firstname, lastname, email, password, confirmpassword, phone, role } = req.body;

            if (!password || !confirmpassword) {
                return res.status(400).json({ msg: 'Password fields are required' });
            }

            if (password !== confirmpassword) {
                return res.status(400).json({ msg: 'Passwords do not match' });
            }

            let user = await this.model.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new this.model({
                firstname,
                lastname,
                email,
                password: hashedPassword,
                phone,
                role
            });

            await user.save();
            res.status(201).json({ msg: 'User registered successfully' });
        } catch (error) {
            console.error('Error in create function:', error.message);
            res.status(500).send('Server error');
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
            let user = await this.model.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid email or password' });
            }

            // ตรวจสอบรหัสผ่าน
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid email or password' });
            }

            // สร้าง JWT
            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || 'your_jwt_secret_key', // ใช้ process.env.JWT_SECRET หรือ default key
                { expiresIn: '1h' }
            );

            res.json({ token });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    };

    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;

            // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
            let user = await this.model.findOne({ email });
            if (!user) {
                console.error('User not found');
                return res.status(400).json({ msg: 'User not found' });
            }

            // สร้าง reset token
            const resetToken = crypto.randomBytes(20).toString('hex');

            // ตั้งค่าหมดอายุของ token เป็น 1 ชั่วโมง
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

            // อัปเดตผู้ใช้ด้วย reset token และเวลาหมดอายุ
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();

            // สร้างลิงก์สำหรับการตั้งค่ารหัสผ่านใหม่
            const resetUrl = `http://${req.headers.host}/resetPassword/${resetToken}`;

            // ตั้งค่า nodemailer
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                to: user.email,
                from: process.env.EMAIL,
                subject: 'Password Reset',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                       Please click on the following link, or paste this into your browser to complete the process:\n\n
                       ${resetUrl}\n\n
                       If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ msg: 'An email has been sent to reset your password' });
        } catch (error) {
            console.error('Error in forgotPassword:', error);
            res.status(500).send('Server error');
        }
    };

    // ฟังก์ชันสำหรับรีเซ็ตรหัสผ่าน
    resetPassword = async (req, res) => {
        try {
            const { resetToken, newPassword, confirmPassword } = req.body;

            // ตรวจสอบว่ารหัสผ่านใหม่ตรงกันหรือไม่
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ msg: 'Passwords do not match' });
            }

            // ค้นหาผู้ใช้ที่มี reset token และตรวจสอบว่า token หมดอายุหรือไม่
            let user = await this.model.findOne({
                resetPasswordToken: resetToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
            }

            // เข้ารหัสรหัสผ่านใหม่
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // อัปเดตรหัสผ่านของผู้ใช้และล้างค่า reset token และเวลาหมดอายุ
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(200).json({ msg: 'Password has been reset successfully' });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    };

    // วิธีการอื่นๆ ของ CRUD...
}

export default RegisterModelCtrl;
