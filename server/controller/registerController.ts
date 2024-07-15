import RegisterModel from '../models/registerModel'; // นำเข้า RegisterModel
import User from '../models/userModel'; // นำเข้า User
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
    model = RegisterModel; // ใช้ RegisterModel สำหรับ Employee
    modelUser = User; // ใช้ User สำหรับ userModel

    create = async (req, res) => {
        try {
            const { firstname, lastname, email, password, confirmpassword, phone, role } = req.body;

    
            if (!password || !confirmpassword) {
                return res.status(400).json({ msg: 'Password fields are required' });
            }
    
            if (password !== confirmpassword) {
                return res.status(400).json({ msg: 'Passwords do not match' });
            }
    
            let employee = await this.model.findOne({ email });
            if (employee) {
                return res.status(400).json({ msg: 'Employee already exists' });
            }
    
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            employee = new this.model({
                firstname,
                lastname,
                email,
                password: hashedPassword,
                phone,
            });
    
            await employee.save();
            console.log('Employee saved:', employee);
    
            const newUser = new User({
                email: email,
                password: hashedPassword,
                role: role || 'user',
                employeeId: employee._id
            });
    
    
            await newUser.save();
            // console.log('User saved:', newUser);
    
            const savedUser = await this.modelUser.findById(newUser._id);
            console.log('Saved User:', savedUser);
    
            res.status(201).json({ msg: 'User registered successfully' });
        } catch (error) {
            console.error('Error in create function:', error.message);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ msg: error.message });
            }
            res.status(500).send('Server error');
        }
    };

    getEmp = async (req, res) => {
        try {
            const { email } = req.query;

            if (!email) {
                return res.status(400).json({ msg: 'Email is required' });
            }

            let employee = await this.model.findOne({ email });

            if (!employee) {
                return res.status(404).json({ msg: 'Employee not found' });
            }

            res.status(200).json({
                firstname: employee.firstname,
                lastname: employee.lastname,
                email: employee.email,
                phone: employee.phone,
            });
        } catch (error) {
            console.error('Error in getEmp function:', error.message);
            res.status(500).send('Server error');
        }
    };

    getAllUsers = async (req, res) => {
        try {
            // ทำการดึงข้อมูลจากฐานข้อมูล employee และ user พร้อมกัน
            const [employees, users] = await Promise.all([
                this.model.find({}), // สมมติว่า this.model คือ model ของ employee
                this.modelUser.find({}) // this.modelUser คือ model ของ user
            ]);

            // รวมผลลัพธ์เข้าด้วยกัน
            const combinedResults = {
                employees,
                users
            };

            // ส่งผลลัพธ์กลับไปให้ client
            res.status(200).json(combinedResults);
        } catch (error) {
            console.error('Error in getAllUsers function:', error.message);
            res.status(500).send('Server error');
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            let user = await this.modelUser.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid email or password' });
            }

            const payload = {
                employee: {
                    id: user.id,
                    // firstname:user.firstname,
                    // lastname:user.lastname,
                    // phone:user.phone,
                    
                }
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || 'your_jwt_secret_key', // ใช้ process.env.JWT_SECRET หรือ default key
                { expiresIn: '1h' } //กำหนดเวลา 1 ชั่วโมง เพื่อ?
            );

            res.json({ token });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    };

    auth = async (req, res, next) => {
        const token = req.header('Authorization').replace('Bearer ', '');
        console.log("auth Middleware: ",token)
        if (!token) {
          return res.status(401).json({ msg: 'No token, authorization denied' });
        }
      
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
          req.user = decoded.user;
          next();
        } catch (err) {
          res.status(401).json({ msg: 'Token is not valid' });
        }
      };

      getUserProfile = async (req, res) => {
        try {
            const userId = req.user.id; // Assuming the user ID is available in req.user.id
            let user = await this.model.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error('Error in getUserProfile function:', error.message);
            res.status(500).send('Server error');
        }
    };
    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            let employee = await this.model.findOne({ email });
            if (!employee) {
                return res.status(400).json({ msg: 'Employee not found' });
            }

            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

            employee.resetPasswordToken = resetToken;
            employee.resetPasswordExpires = resetTokenExpiry;
            await employee.save();

            const resetUrl = `http://${req.headers.host}/resetPassword/${resetToken}`;

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                to: employee.email,
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

            let employee = await this.model.findOne({
                resetPasswordToken: resetToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!employee) {
                return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            employee.password = hashedPassword;
            employee.resetPasswordToken = undefined;
            employee.resetPasswordExpires = undefined;
            await employee.save();

            res.status(200).json({ msg: 'Password has been reset successfully' });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    };

    updateUserDetails = async (req, res) => {
        try {
            const { id } = req.params;
            const { firstname, lastname, phone, role, address, provine, district, subDistrict, postcode, detail } = req.body;

            let employee = await this.model.findById(id);
            if (!employee) {
                return res.status(404).json({ msg: 'Employee not found' });
            }

            employee.firstname = firstname || employee.firstname;
            employee.lastname = lastname || employee.lastname;
            employee.phone = phone || employee.phone;
            employee.address = address || employee.address;
            employee.provine = provine || employee.provine;
            employee.district = district || employee.district;
            employee.subDistrict = subDistrict || employee.subDistrict;
            employee.postcode = postcode || employee.postcode;
            employee.detail = detail || employee.detail;

            await employee.save();
            res.status(200).json({ msg: 'Employee updated successfully' });
        } catch (error) {
            console.error('Error in updateUserDetails function:', error.message);
            res.status(500).send('Server error');
        }
    };

    updateProfile = async (req, res) => {
        try {
            const employeeId = req.user.id;
            const { firstname, lastname, phone, address, provine, district, subDistrict, postcode, detail } = req.body;

            let employee = await this.model.findById(employeeId);
            if (!employee) {
                return res.status(404).json({ msg: 'Employee not found' });
            }

            employee.firstname = firstname || employee.firstname;
            employee.lastname = lastname || employee.lastname;
            employee.phone = phone || employee.phone;
            employee.address = address || employee.address;
            employee.provine = provine || employee.provine;
            employee.district = district || employee.district;
            employee.subDistrict = subDistrict || employee.subDistrict;
            employee.postcode = postcode || employee.postcode;
            employee.detail = detail || employee.detail;

            if (req.file) {
                employee.profileImage = req.file.path;
            }

            await employee.save();
            res.status(200).json({ msg: 'Profile updated successfully' });
       

        } catch (error) {
            console.error('Error in updateProfile function:', error.message);
            res.status(500).send('Server error');
        }
    };
    // วิธีการอื่นๆ ของ CRUD...
}

export default RegisterModelCtrl;
