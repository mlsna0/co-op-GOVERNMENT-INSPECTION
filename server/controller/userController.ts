import { Request, Response } from 'express';
import mongoose from 'mongoose';
import userModel from '../models/userModel';
import BaseCtrl from './base';

class UserController extends BaseCtrl {
    model = userModel;

    createMultipleUsers = async (req: Request, res: Response) => {
      try {
          const usersData = req.body.users; // Assuming body contains an array of user objects
          const users = usersData.map(user => new this.model({
              fullName: user.fullName,
              rank: user.rank 
          }));
          const createdUsers = await this.model.insertMany(users);
          res.status(201).json(createdUsers);
      } catch (error) {
          res.status(400).json({ error: error.message });
      }
  };
}

export default UserController;
