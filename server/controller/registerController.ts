import RegisterModel from '../models/registerModel';
import BaseCtrl from './base';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });


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

    getEmp = async (req, res) => {
        try {
            const { email } = req.query;

            if (!email) {
                return res.status(400).json({ msg: 'Email is required' });
            }

            let user = await this.model.findOne({ email });

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            res.status(200).json({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.role
            });
        } catch (error) {
            console.error('Error in getEmp function:', error.message);
            res.status(500).send('Server error');
        }
    };

    getAllUsers = async (req, res) => {
        try {
            const users = await this.model.find({});
            res.status(200).json(users);
        } catch (error) {
            console.error('Error in getAllUsers function:', error.message);
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
          let user = await this.model.findOne({ email });
          if (!user) {
            return res.status(400).json({ msg: 'User not found' });
          }
      
          const resetToken = crypto.randomBytes(20).toString('hex');
          const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      
          user.resetPasswordToken = resetToken;
          user.resetPasswordExpires = resetTokenExpiry;
          await user.save();
      
          const resetUrl = `http://${req.headers.host}/resetPassword/${resetToken}`;
      
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
      
      resetPassword = async (req, res) => {
        try {
          const { resetToken, newPassword, confirmPassword } = req.body;
          if (newPassword !== confirmPassword) {
            return res.status(400).json({ msg: 'Passwords do not match' });
          }
      
          let user = await this.model.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
          });
      
          if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
          }
      
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);
      
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

    updateUserDetails = async (req, res) => {
        try {
            const { id } = req.params; // Assume the user ID is passed in the URL parameters
            const { firstname, lastname, phone, role, address, provine, district, subDistrict, postcode, detail } = req.body;
    
            let user = await this.model.findById(id);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
    
            user.firstname = firstname || user.firstname;
            user.lastname = lastname || user.lastname;
            user.phone = phone || user.phone;
            user.role = role || user.role;
            user.address = address || user.address;
            user.provine = provine || user.provine;
            user.district = district || user.district;
            user.subDistrict = subDistrict || user.subDistrict;
            user.postcode = postcode || user.postcode;
            user.detail = detail || user.detail;
    
            await user.save();
            res.status(200).json({ msg: 'User updated successfully' });
        } catch (error) {
            console.error('Error in updateUserDetails function:', error.message);
            res.status(500).send('Server error');
        }
    };
    updateProfile = async (req, res) => {
        try {
            const userId = req.user.id; // Assuming the user ID is available in req.user.id
            const { firstname, lastname, phone, address, provine, district, subDistrict, postcode, detail } = req.body;

            let user = await this.model.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // อัปเดตข้อมูลโปรไฟล์
            user.firstname = firstname || user.firstname;
            user.lastname = lastname || user.lastname;
            user.phone = phone || user.phone;
            user.address = address || user.address;
            user.provine = provine || user.provine;
            user.district = district || user.district;
            user.subDistrict = subDistrict || user.subDistrict;
            user.postcode = postcode || user.postcode;
            user.detail = detail || user.detail;

            // อัปเดตไฟล์โปรไฟล์ถ้ามีการอัปโหลดไฟล์ใหม่
            if (req.file) {
                user.profileImage = req.file.path;
            }

            await user.save();
            res.status(200).json({ msg: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error in updateProfile function:', error.message);
            res.status(500).send('Server error');
        }
    };
    // วิธีการอื่นๆ ของ CRUD...
}

export default RegisterModelCtrl;
