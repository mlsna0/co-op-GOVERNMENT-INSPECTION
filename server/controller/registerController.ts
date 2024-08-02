import RegisterModel from '../models/registerModel'; // นำเข้า RegisterModel
import User from '../models/userModel'; // นำเข้า User
import authorize from 'middleware/auth/auth';
import TimeStampModelCtrl from './timeStampController';
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
        upload.single('profileImage')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ msg: 'Error uploading file' });
            }
    
            try {
                const { firstname, lastname, email, password, confirmpassword, organization, bearing, phone, address, province, amphure, tambon, postCode, role } = req.body;
    
                if (!password || !confirmpassword) {
                    return res.status(400).json({ msg: 'Password fields are required' });
                }
    
                if (password !== confirmpassword) {
                    return res.status(400).json({ msg: 'Passwords do not match' });
                }
    
                let user = await this.modelUser.findOne({ email });
                if (user) {
                    return res.status(400).json({ msg: 'User already exists' });
                }
    
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
    
                // เพิ่มการอัปโหลดรูปภาพ
                const profileImage = req.file ? req.file.path : null;
    
                const employee = new this.model({
                  
                    firstname,
                    lastname,
                    email,
                    phone,
                    organization,
                    bearing,
                    address,
                    province,
                    amphure,
                    tambon,
                    postCode,
                    profileImage
                });
    
                await employee.save();
    
                const newUser = new this.modelUser({
                    email,
                    password: hashedPassword,
                    role: role || 'user',
                    employeeId: employee._id
                });
    
                await newUser.save();
    
                res.status(201).json({ msg: 'User registered successfully' });
            } catch (error) {
                console.error('Error in create function:', error.message);
                if (error.name === 'ValidationError') {
                    return res.status(400).json({ msg: error.message });
                }
                res.status(500).send('Server error');
            }
        });
    };
    
    public uploadProfile = async (req, res) => {
        try {
          if (!req.file) {
            return res.status(400).send({ message: 'Please upload a file.' });
          }
    
          const userId = req.user.id; // Assumes `req.user.id` is set from auth middleware
          const profileUrl = `/uploads/${req.file.filename}`;
    
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).send({ message: 'User not found.' });
          }
    
          const employee = await RegisterModel.findById(user.employeeId);
          if (!employee) {
            return res.status(404).send({ message: 'Employee not found.' });
          }
    
          employee.profileImage = profileUrl;
          await employee.save();
    
          res.status(200).send({ message: 'Profile uploaded successfully.', employee });
        } catch (err) {
          res.status(500).send(err);
        }
      };
      
    // getEmp = async (req, res) => {
    //     try {
    //         const { email } = req.query;

    //         if (!email) {
    //             return res.status(400).json({ msg: 'Email is required' });
    //         }

    //         let employee = await this.model.findOne({ email });

    //         if (!employee) {
    //             return res.status(404).json({ msg: 'Employee not found' });
    //         }

    //         res.status(200).json({
    //             firstname: employee.firstname,
    //             lastname: employee.lastname,
    //             phone: employee.phone,
    //         });
    //     } catch (error) {
    //         console.error('Error in getEmp function:', error.message);
    //         res.status(500).send('Server error');
    //     }
    // };

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
    
            let employee = await this.model.findById(user.employeeId);
            if (!employee) {
                return res.status(400).json({ msg: 'Invalid email or password' });
            }
    
            const payload = {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstname: employee.firstname,
                    lastname: employee.lastname,
                    phone: employee.phone,
                    organization: employee.organization,
                    bearing: employee.bearing,
                    address: employee.address,
                    amphure: employee.amphure,
                    tambon: employee.tambon,
                    postCode: employee.postCode,
                    detail: employee.detail,
                    profileImg: employee.profileImage
                }
            }; 
    
             // เพิ่มการบันทึก timestamp
             const timeStampCtrl = new TimeStampModelCtrl();
             await timeStampCtrl.addTimeStamp(user.id);

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );
    
            // ส่งข้อมูลผู้ใช้และโทเค็นกลับไป
            res.json({ token, user: payload.user });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    };
    

    // auth = async (req, res, next) => {
    //     const token = req.header('Authorization').replace('Bearer ', '');
    //     console.log("auth Middleware: ",token)
    //     if (!token) {
    //       return res.status(401).json({ msg: 'No token, authorization denied' });
    //     }
      
    //     try {
    //       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    //       req.user = decoded.user;
    //       next();
    //     } catch (err) {
    //       res.status(401).json({ msg: 'Token is not valid' });
    //     }
    //   };

    // checkRole = (role) => {
    //     return (req, res, next) => {
    //         if (req.user && req.user.role === role) {
    //             next();
    //         } else {
    //             res.status(403).json({ msg: 'Forbidden' });
    //         }
    //     };
    // };


      getUserProfile = async (req, res) => {
   
     
        try {
            const userId = req.user.id; // Assuming the user ID is available in req.user.id
            console.log("User ID:",userId);
            let user = await this.modelUser.findById(userId).select('-password').populate('employeeId'); // ใช้ populate เพื่อรวมข้อมูล employee
            if (!user) {
                console.log("User not found in database.");
                return res.status(404).json({ msg: 'User not found' });
            }
            console.log("Data user: ",user)
            res.status(200).json(user);
        } catch (error) {
            console.error('Error in getUserProfile function:', error.message);
            res.status(500).send('Server error');
        }
    };


    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            let user = await this.modelUser.findOne({ email });
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
    
            let user = await this.modelUser.findOne({
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
    
    

    updateEmployeeProfile = async (req, res) => {
        // เพิ่ม upload.single('profileImage') ก่อนฟังก์ชั่น async
        upload.single('profileImage')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ msg: 'Error uploading file' });
            }
    
            try {
                const { id } = req.params; // ใช้ ID จากพารามิเตอร์ถ้ามี
                const employeeId = id || req.user.id; // ถ้าไม่มี ID ในพารามิเตอร์ ให้ใช้ ID ของผู้ใช้ที่ล็อกอิน
    
                const { firstname, lastname, phone, address, province, amphure, tambon, postCode, detail } = req.body;
    
                let employee = await this.model.findById(employeeId);
                if (!employee) {
                    return res.status(404).json({ msg: 'Employee not found' });
                }
    
                employee.firstname = firstname || employee.firstname;
                employee.lastname = lastname || employee.lastname;
                employee.phone = phone || employee.phone;
                employee.address = address || employee.address;
                employee.province = province || employee.province;
                employee.amphure = amphure || employee.amphure;
                employee.tambon = tambon || employee.tambon;
                employee.postCode = postCode || employee.postCode;
                employee.detail = detail || employee.detail;
    
                // อัปเดตโปรไฟล์รูปภาพถ้ามีไฟล์อัปโหลด
                if (req.file) {
                    employee.profileImage = req.file.path;
                }
    
                await employee.save();
                res.status(200).json({ msg: 'Employee profile updated successfully' });
    
            } catch (error) {
                console.error('Error in updateEmployeeProfile function:', error.message);
                res.status(500).send('Server error');
            }
        });
    };
    updateUserRole = async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;
            console.log('Received update role request for user id:', id); // เพิ่มบรรทัดนี้
            console.log('Role to update:', role); // เพิ่มบรรทัดนี้
    
            if (!role) {
                return res.status(400).json({ msg: 'Role is required' });
            }
    
            let user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
    
            user.role = role;
            await user.save();
    
            res.status(200).json({ msg: 'User role updated successfully' });
        } catch (error) {
            console.error('Error in updateUserRole function:', error.message);
            res.status(500).send('Server error');
        }
    };
    getUsers = async (req, res) => {
        try {
            // ดึงข้อมูล user ทั้งหมดจากฐานข้อมูล
            const users = await this.modelUser.find({}).select('-password'); // ใช้ select เพื่อละเว้น password

            // ส่งผลลัพธ์กลับไปให้ client
            res.status(200).json(users);
        } catch (error) {
            console.error('Error in getUsers function:', error.message);
            res.status(500).send('Server error');
        }
    };
    // วิธีการอื่นๆ ของ CRUD...
}

export default RegisterModelCtrl;
