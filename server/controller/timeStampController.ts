import TimeStamp from '../models/timeStampModel';
import BaseCtrl from './base';

class TimeStampModelCtrl extends BaseCtrl {
  model = TimeStamp;

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
}

export default TimeStampModelCtrl;