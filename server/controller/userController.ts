import mongoose from 'mongoose';
import userModel from '../models/userModel';
import BaseCtrl from './base';
import User from '../models/userModel';

class UserModelCtrl extends BaseCtrl {
    model = userModel;

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

}

export default UserModelCtrl;
