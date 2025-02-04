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
import fs from 'fs'; // นำเข้า fs module
import Agency from '../models/agencyModel'; 
import mongoose from 'mongoose';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // ตรวจสอบว่าโฟลเดอร์ uploads มีอยู่และมีสิทธิ์การเขียน
        const uploadDir = 'dist/uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

class RegisterModelCtrl extends BaseCtrl {
    model = RegisterModel; // ใช้ RegisterModel สำหรับ Employee
    modelUser = User; // ใช้ User สำหรับ userModel
    modelAgency = Agency

    create = async (req, res) => {
        
     
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
                console.log("create : ",req.body)
                 // แปลง organization (ซึ่งเป็น _id) ให้เป็น ObjectId
                const organizationId = new mongoose.Types.ObjectId(organization);

                const agency = await Agency.findOne({_id : organizationId});
            
                if (!agency) {
                    return res.status(400).json({ msg: 'Agency not found' });
                }
        
    
                // เพิ่มการอัปโหลดรูปภาพ
                const profileImage = req.file ? req.file.filename : null;
            
                
                const employee = new this.model({
                    firstname,
                    lastname,
                    email,
                    phone,
                    organization: agency.agency_name, 
                    bearing,
                    address,
                    province,
                    amphure,
                    tambon,
                    postCode,
                    profileImage,
                    agencies: [agency._id]
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
    
            if (!employees || !users) {
                return res.status(404).json({ message: 'Employees or users not found' });
            }
    
            // รวมผลลัพธ์เข้าด้วยกัน
            const combinedResults = {
                employees,
                users
            };
    
            // ส่งผลลัพธ์กลับไปให้ client
            res.status(200).json(combinedResults);
        } catch (error) {
            // console.error('Error in getAllUsers function:', error.message);
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
            //ตรวจสอบสถานะการใช้สิทธิ
            if (user.isActive === false) {
                return res.status(200).json({ msg: 'Account is inactive. Contact administrator.', userIsActive: user.isActive });
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
            // console.error(error.message);
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
            // console.log("User ID:",userId);
            let user = await this.modelUser.findById(userId).select('-password').populate('employeeId'); // ใช้ populate เพื่อรวมข้อมูล employee
            if (!user) {
                // console.log("User not found in database.");
                return res.status(404).json({ msg: 'User not found' });
            }
            // console.log("Data user: ",user)
            res.status(200).json(user);
        } catch (error) {
            // console.error('Error in getUserProfile function:', error.message);
            res.status(500).send('Server error');
        }
    };
    getOrganizationById = async (req, res) => {
        try {
            const OrganizationID = req.params.id;
            // console.log("Received Organization ID:", OrganizationID);
    
            if (!mongoose.Types.ObjectId.isValid(OrganizationID)) {
                return res.status(400).json({ msg: 'Invalid Organization ID' });
            }
    
            let Organization = await this.modelAgency.findById(OrganizationID);
            // console.log("Fetched Organization:", Organization);
    
            if (!Organization) {
                return res.status(404).json({ msg: 'Organization not found' });
            }
    
            res.status(200).json(Organization);
        } catch (error) {
            console.error('Error in getOrganizationById function:', error.message);
            res.status(500).send('Server error');
        }
    };
    getPersonsWithSameOrganization = async (req, res) => {
        try {

            // const agencyID = req.params.id; // ดึง agency ID ที่ต้องการค้นหา
            const agencyID = new mongoose.Types.ObjectId(req.params.id);
            // console.log("ID agencyID: ",agencyID)
    
            if (!mongoose.Types.ObjectId.isValid(agencyID)) {
                return res.status(400).json({ msg: 'รหัส Agency ไม่ถูกต้อง' });
            }
    
            // // ค้นหาบุคคลทั้งหมดที่มี agency ID ตรงกันใน agencies field
            // let persons = await this.model.find({
            //     agencies: agencyID
            // });
    
            // if (persons.length === 0) {
            //     return res.status(404).json({ msg: 'ไม่พบบุคคลที่อยู่ใน Agency นี้' });
            // }

                  // ค้นหาบุคคลทั้งหมดที่มี agency ID ตรงกันใน agencies field
                  
             // ค้นหา Employees ที่มี agencies ตรงกับ agencyID
             let employees = await this.model.find({
                            'agencies': agencyID
                });
             if (employees.length === 0) {
                    return res.status(404).json({ msg: 'ไม่พบบุคคลที่อยู่ใน Agency นี้' });
             }

            
             const employeeIds = employees.map(emp => emp._id);

             // ค้นหา Users ที่มี employeeId ตรงกับ employeeIds ที่ค้นพบ
             let users = await User.find({
                 'employeeId': { $in: employeeIds }
             }).populate('employeeId');
     
             if (users.length === 0) {
                 return res.status(404).json({ msg: 'ไม่พบบุคคลที่อยู่ใน Agency นี้' });
             }
    
            res.status(200).json(users);
            // res.status(200).json(response);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในฟังก์ชัน getPersonsWithSameAgency:', error.message);
            res.status(500).send('ข้อผิดพลาดในเซิร์ฟเวอร์');
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
            // console.error('Error in forgotPassword:', error);
            res.status(500).send('Server error');
        }
    };
    
    resetPassword = async (req, res) => {
        try {
            // console.log('Request Body:', req.body);
            const { oldPassword, newPassword, confirmPassword, userIdToReset } = req.body;
            
            if (!newPassword || !confirmPassword) {
                return res.status(400).json({ msg: 'Please fill in all required fields' });
            }
    
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ msg: 'Passwords do not match' });
            }
    
            const userId = req.user ? req.user.id : null;
            const role = req.user ? req.user.role : null; // สมมติว่าคุณมี field "role" ใน user object
            // console.log('User ID:', userId);
            // console.log('Role:', role);
    
            if (!userId) {
                return res.status(401).json({ msg: 'Authorization required' });
            }
    
            // ค้นหา user ที่ต้องการเปลี่ยนรหัสผ่าน
            const targetUserId = role === 'superadmin' && userIdToReset ? userIdToReset : userId;
            let user = await this.modelUser.findById(targetUserId);
            // console.log('User found:', user);
            
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }
    
            // ตรวจสอบรหัสผ่านเก่าถ้าผู้ใช้ไม่ใช่ superadmin
            if (role !== 'superadmin') {
                const isMatch = await bcrypt.compare(oldPassword, user.password);
                // console.log('Passwords match:', isMatch);
    
                if (!isMatch) {
                    return res.status(400).json({ msg: 'Old password is incorrect' });
                }
            }
    
            // รีเซ็ตรหัสผ่าน
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            // console.log('New hashed password:', hashedPassword);
    
            user.password = hashedPassword;
            await user.save();
    
            res.status(200).json({ msg: 'Password has been reset successfully' });
        } catch (error) {
            // console.error('Error in resetPassword function:', error);
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
                console.log("update ID?",id)
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
                // console.error('Error in updateEmployeeProfile function:', error.message);
                res.status(500).send('Server error');
            }
        });
    };
    updateUserRole = async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;
            // console.log('Received update role request for user id:', id); // เพิ่มบรรทัดนี้
            // console.log('Role to update:', role); // เพิ่มบรรทัดนี้
    
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
            // console.error('Error in updateUserRole function:', error.message);
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
            // console.error('Error in getUsers function:', error.message);
            res.status(500).send('Server error');
        }
    };
    // วิธีการอื่นๆ ของ CRUD...
}


export default RegisterModelCtrl;
