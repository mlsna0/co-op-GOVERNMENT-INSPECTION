import TimeStamp from '../models/timeStampModel';
import BaseCtrl from './base';

class TimeStampModelCtrl extends BaseCtrl {
  model = TimeStamp;

  // Method to add a timestamp
  addTimeStamp = async (req, res) => {
    try {
      const userId = req.user.id;
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toISOString().split('T')[1].split('.')[0];

      const newTimeStamp = new TimeStamp({
        userId,
        date,
        time
      });

      const savedTimeStamp = await newTimeStamp.save();

      res.status(201).json(savedTimeStamp);
    } catch (error) {
      res.status(500).json({ message: 'Error adding timestamp', error });
    }
  };
}

export default TimeStampModelCtrl;