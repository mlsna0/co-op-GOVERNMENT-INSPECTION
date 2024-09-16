import mongoose from 'mongoose';
import { Types } from 'mongoose';
import userModel from '../models/userModel';
import  RegisterModel from '../models/registerModel';
import BaseCtrl from './base';
import User from '../models/userModel';
import { registerModel } from 'models/registerModel';
import bcrypt from 'bcryptjs';

class UserModelCtrl extends BaseCtrl {
    model = userModel;
    modelEmployee = RegisterModel;

    // New method to get a user by ID
    getUserById = async (req, res) => {
        try {
            const userId = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            const user = await this.model.findById(userId).populate('employeeId');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    updateUserById = async (req, res) => {
      try {
          // ตรวจสอบว่า ID ถูกส่งมาหรือไม่
          // console.log("req.params : ",req.params)
          // console.log("req จาก body",req.body)


      

          const { 
            firstname, lastname, email,  password, confirmpassword,  organization, 
            address, phone, province, amphure, tambon, postCode,
        } = req.body;
        
          const { id } = req.params;
          if (!id) {
              return res.status(400).json({ msg: 'User ID is required' });
          }
          // หา user จากฐานข้อมูล
          let user = await this.model.findById(id).populate('employeeId');
            if (user && user.employeeId) {
                  // console.log('Populated employeeId:', user.employeeId,user);
              } else {
                //  console.error('EmployeeId not populated');
              }
          
          // รับข้อมูลจาก request body
     
          // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่
          if (password && password !== confirmpassword) {
              return res.status(400).json({ msg: 'Passwords do not match' });
          }
    
  
          if (user.employeeId instanceof Types.ObjectId) {
            return res.status(400).json({ msg: 'Employee data not populated' });
        }
         const employee:any = user.employeeId as registerModel; 
        //  console.log("user.employeeId: ",employee)
        //   // อัปเดตข้อมูลผู้ใช้
        //   employee.firstname = firstname || employee.firstname;
        //   employee.lastname = lastname || employee.lastname;
  
        //   employee.organization = organization || employee.organization;
        //   employee.address = address || employee.address;
        //   employee.phone = phone || employee.phone;
        //   employee.province = province || employee.province;
        //   employee.amphure = amphure || employee.amphure;
        //   employee.tambon = tambon || employee.tambon;
        //   employee.postCode = postCode || employee.postCode;

        if (req.file) {
          employee.profileImage = req.file.path; // บันทึกเส้นทางไฟล์รูปภาพที่อัปโหลด
        }

        let profileImage:any = req.file ? req.file.filename : null

        let updateData :any 
        if (profileImage != null) {
          if(employee) {
            updateData = await this.modelEmployee.findOneAndUpdate(
              {
              _id: employee._id
            },
            {
              firstname: firstname,
              lastname: lastname,
              email: email,
              organization : organization ,
              address : address,
              phone : phone,
              province : province,
              amphure :  amphure,
              tambon : tambon,
              postCode : postCode,
              profileImage:profileImage,
            }
          )
          }
          await this.model.findOneAndUpdate(
            { _id: id }, 
            {
              email: email || user.email,
              password: password || user.password, // Hash password ถ้าจำเป็น
            }
          );
          res.status(200).json({ msg: 'User profile updated successfully', updateData });
        }
        else {
          if(employee) {
            updateData = await this.modelEmployee.findOneAndUpdate(
              {
              _id: employee._id
            },
            {
              firstname: firstname,
              lastname: lastname,
              email: email,
              organization : organization ,
              address : address,
              phone : phone,
              province : province,
              amphure :  amphure,
              tambon : tambon,
              postCode : postCode,
            }
          )
          }
          await this.model.findOneAndUpdate(
            { _id: id }, 
            {
              email: email || user.email,
              password: password || user.password, // Hash password ถ้าจำเป็น
            }
          );
          res.status(200).json({ msg: 'User profile updated successfully', updateData });
        }
       
          // user.email = email ||   user.email;
          // if (password) {
          //     user.password = password; // อย่าลืม hash รหัสผ่านถ้าจำเป็น
          // }
          // ถ้ามีรูปภาพให้ upload
          // บันทึกข้อมูลที่อัปเดตลงฐานข้อมูล
          // await user.save();
      } catch (error) {
          // console.error('Error updating user:', error.message);
          res.status(500).json({ msg: 'Server error' });
      }
  };
  
    async updateUserRole(req, res): Promise<void> {
        const { userId, role } = req.body;
    
        if (!userId || !role) {
          res.status(400).send('Employee ID and role are required.');
          return;
        }
    
        try {
          const user = await User.findOneAndUpdate(
            { userId },
            { role },
            { new: true }
          );
    
          if (!user) {
            res.status(404).send('User not found.');
            return;
          }
    
          res.send(user);
        } catch (error) {
          res.status(500).send('Server error.');
        }
      }

      async updateUserStatus(req, res): Promise<void> {
        const  { isActive } = req.body;
        const userId = req.params.userId;
        // console.log("userid params: ",userId)
        if (!userId || !isActive === undefined) {
          res.status(400).send('Employee ID and Staus are required.');
          return;
        }
        if (isActive === undefined || isActive === null) {
          return res.status(400).send('Status is required.');
        }
        
    
        try {
          const user = await User.findOneAndUpdate(
            { _id: userId },
            { isActive },
            { new: true }
          );
    
          if (!user) {
            res.status(404).send('User not found.');
            return;
          }
          // console.log(user.role)
  
               // ถ้าผู้ใช้มี role เป็น 'admin' และกำลังเปลี่ยนสถานะ
        if (user.role === 'admin') {
          if (!user.employeeId) {
            return res.status(400).send('User does not have an associated employee.');
          }
          // ดึงข้อมูล Employee ที่เชื่อมโยงกับ user ผ่าน employeeId
          const employee = await RegisterModel.findById(user.employeeId).populate('agencies'); //ทำไมต้องโดยตรง?
          
          if (!employee) {
            console.log("No employee found for ID:", user.employeeId);
              res.status(404).send('Employee not found.');
              return;
          }
           // ดึง employees ที่อยู่ใน agency เดียวกับ employee นี้
        let employees = await RegisterModel.find({
          'agencies': { $in: employee.agencies }
      });

      if (employees.length === 0) {
          return res.status(404).json({ msg: 'ไม่พบบุคคลที่อยู่ใน Agency นี้' });
      }

      const employeeIds = employees.map(emp => emp._id);

        // ค้นหาผู้ใช้ที่มี employeeId ตรงกับ employeeIds ที่ค้นพบ
        let users = await User.find({
          'employeeId': { $in: employeeIds }
      });

      if (users.length === 0) {
          return res.status(404).json({ msg: 'ไม่พบบุคคลที่อยู่ใน Agency นี้' });
      }

      // อัพเดตสถานะผู้ใช้ที่มี role เป็น 'user'
      await User.updateMany(
          { employeeId: { $in: employeeIds }, role: 'user' },
          { isActive: isActive }
      );
      }
    
          res.send(user);
        } catch (error) {
          console.error('Error updating user status:', error);
          res.status(500).send('Server error.');
        }
      }

      resetPassword = async (req, res) => {
        try {
            // console.log('Request Body:', req.body);
            const { userIdToReset } = req.body;
    
            // กำหนดรหัสผ่านเริ่มต้นเป็น 12345678
            const defaultPassword = "12345678";
    
            // รับ userId และ role จาก req.user
            const userId = req.user ? req.user.id : null;
            const role = req.user ? req.user.role : null;
    
            // console.log('User ID:', userId);
            // console.log('Role:', role);
    
            if (!userId) {
                return res.status(401).json({ msg: 'Authorization required' });
            }
    
            // ตรวจสอบว่า role เป็น superadmin หรือไม่
            if (role !== 'superadmin') {
                return res.status(403).json({ msg: 'Access denied. Only superadmin can reset passwords.' });
            }
    
            // ตรวจสอบว่าได้ระบุ userIdToReset หรือไม่
            if (!userIdToReset) {
                return res.status(400).json({ msg: 'User ID to reset is required' });
            }
    
            // ค้นหา user ที่ต้องการรีเซ็ตรหัสผ่าน
            let user = await this.model.findById(userIdToReset);
            // console.log('User found:', user);
    
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }
    
            // รีเซ็ตรหัสผ่านเป็น defaultPassword
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultPassword, salt);
            // console.log('New hashed default password:', hashedPassword);
    
            user.password = hashedPassword;
            await user.save();
    
            res.status(200).json({ msg: `Password has been reset to default for user ID ${userIdToReset}` });
        } catch (error) {
            // console.error('Error in resetPassword function:', error);
            res.status(500).send('Server error');
        }
    };
    

}

export default UserModelCtrl;
