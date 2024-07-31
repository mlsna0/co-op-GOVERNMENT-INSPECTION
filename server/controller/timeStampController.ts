import mongoose from 'mongoose';
import TimeStamp from 'models/timeStampModel';
import BaseCtrl from './base';
import RegisterModel from 'models/registerModel';

class timeStampModelCtrl extends BaseCtrl {
    model = TimeStamp;

    addTimeStamp = async (req, res) => {
        try {
          const { userId, date, time } = req.body;
    
          const newTimeStamp = new TimeStamp({
            userId,
            date,
            time
          });
    
          const savedTimeStamp = await newTimeStamp.save();
    
          await RegisterModel.findByIdAndUpdate(userId, {
            $push: { timestamps: savedTimeStamp._id }
          });
    
          res.status(201).json(savedTimeStamp);
        } catch (error) {
          res.status(500).json({ message: 'Error adding timestamp', error });
        }
      };
    }
  
  export default timeStampModelCtrl;