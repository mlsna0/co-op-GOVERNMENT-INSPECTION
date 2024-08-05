import TimeStamp from '../models/timeStampModel';
import BaseCtrl from './base';
import RegisterModel from '../models/registerModel'; // เพิ่มการนำเข้า model ของ employee
import User from '../models/userModel'; // เพิ่มการนำเข้า model ของ user

class TimeStampModelCtrl extends BaseCtrl {
  model = TimeStamp;
 
  employeeModel = RegisterModel;
  userModel = User; 

  // Method to add a timestamp
  addTimeStamp = async (userId) => {
    try {
      const now = new Date();
      const date = now.toLocaleDateString(); // วันที่ตามเขตเวลาท้องถิ่น
      const time = now.toLocaleTimeString(); // เวลาตามเขตเวลาท้องถิ่น

      const newTimeStamp = new TimeStamp({
        userId,
        date,
        time
      });

      const savedTimeStamp = await newTimeStamp.save();
      return savedTimeStamp;
    } catch (error) {
      console.error('Error adding timestamp:', error);
      throw error;
    }
  };

  getTimeLogin = async (req, res) => {
    try {
      // ดึงข้อมูลของ users ทั้งหมด
      const users = await this.userModel.find({});
      console.log(`Found users: ${users}`);
  
      if (users.length === 0) {
        console.log('No users found');
        return res.status(404).send('No users found');
      }
  
      // ดึงข้อมูลของ employees ทั้งหมด
      const employees = await this.employeeModel.find({});
      console.log(`Found employees: ${employees}`);
  
      if (employees.length === 0) {
        console.log('No employees found');
        return res.status(404).send('No employees found');
      }
  
      // ดึงข้อมูลของ documents ทั้งหมด
      const timestamp = await this.model.find({});
      console.log(`Found documents: ${timestamp}`);
  
      if (timestamp.length === 0) {
        console.log('No timestamp found');
        return res.status(404).send('No timestamp found');
      }
  
      res.status(200).json({ users, employees, timestamp });
    } catch (error) {
      console.error('Error in getAllRecords function:', error.message);
      res.status(500).send('Server error');
    }
  }

}

export default TimeStampModelCtrl;