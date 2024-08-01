import recordModel from '../models/recordModel';
import ViewModel from '../models/viewModel';

import multer, { StorageEngine } from 'multer';
import { Request, Response } from 'express';
// import DetailModel from 'models/detailModel';
import BaseCtrl from './base';
// import { buffer } from 'stream/consumers';
import * as path from 'path';
import * as fs from 'fs';
import jwt from 'jsonwebtoken';


interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const storage: StorageEngine = multer.memoryStorage();
const upload = multer({ storage: storage }).single('pdf');


class recorCon extends BaseCtrl {
  // auth(auth: any, postItemToView: (req: any, res: any) => Promise<any>) {
  //   throw new Error('Method not implemented.');
  // }
  model = recordModel;
  modelView = ViewModel;
  
  auth = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log("auth ", token);
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      console.log("decoded record : ",decoded)
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
  
  postItemToView = async (req, res) => {
    console.log(req.body);

    try {
      const userID = req.user.id; // ใช้ userID จาก req.user

      const obj = await new this.model({
        record_id: req.body.id,
        record_star_date: req.body.startDate, //start..
        record_end_date: req.body.endDate,
        record_detail: req.body.detail,
        record_location: req.body.location,
        record_topic: req.body.topic,
        record_content: req.body.content,
        record_provine: req.body.provine,
        record_place: req.body.place,
        record_filename: req.body.filename,
        userId: userID // เก็บ userID ใน record
      }).save();

      console.log("obj _Id: ", obj._id);
      if (req.body.personal) {
        let newField = req.body.personal.map(x => { return { view_rank: x.rank, view_first_name: x.firstname, view_last_name: x.lastname, documentId: obj._id }; });

        let result = await this.modelView.insertMany(newField);
      }

      res.status(200).json("ok");
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

updateRecordContent = async (req, res) => {
console.log("Updating record content: ", req.body);
try {
  const { id, content } = req.body;
  const record = await this.model.findByIdAndUpdate(id, { record_content: content }, { new: true });
  if (!record) {
    res.status(404).send('Record not found');
  } else {
    res.status(200).json(record);
  }
} catch (err) {
  res.status(500).send('Error updating record');
}
}


savePDF = async (req: Request, res: Response) => {
console.log('savePDF');

upload(req, res, async (err) => {
  if (err) {
    console.error('Error uploading file:', err);
    return res.status(500).send('Error uploading file');
  }

  const { id } = req.body;
  const file = (req as MulterRequest).file;

  if (!file) {
    console.error('No file uploaded');
    return res.status(400).send('No file uploaded');
  }

  // กำหนดไดเรกทอรีที่ต้องการบันทึกไฟล์
  const directoryPath = path.join(__dirname, '../img');

  // ชื่อไฟล์ใหม่ตาม id
  const newFilename = `${id}.pdf`;
  const filePath = path.join(directoryPath, newFilename);

  // บันทึกไฟล์
  fs.writeFile(filePath, file.buffer, async (err) => {
    if (err) {
      console.error('Error writing PDF file:', err);
      return res.status(500).send('Failed to save PDF');
    }

    try {
      const record = await this.model.findByIdAndUpdate(id, { record_filename: newFilename }, { new: true });
      if (!record) {
        return res.status(404).send('Record not found');
      }
      res.status(200).json(record);
    } catch (err) {
      console.error('Error updating record in database:', err);
      res.status(500).send('Error updating record in database');
    }
  });
});
}
getPDF = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send('Invalid ID');
    return;
  }
  const filePath = path.join(__dirname, '../img', `${id}.pdf`); // Updated path to dist\server\img

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending PDF file:', err);
      res.status(500).send('Error sending PDF file');
    }
  });
}
postDataTest = async (req,res)=>{
  console.log("body : ",req.body)
  try {
    // const obj = await new this.model({
    //   ...req.body
    // }).save();
    
    // console.log("OBJ: ", obj);
    res.status(200).json("obj");
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

getData = async (req, res) => {
  try {
    const records = await this.model.find() // การจัดเรียงลำดับที่ฐานข้อมูล
    records.sort((a:any, b:any) => { return b.record_id - a.record_id})
    const views = await this.modelView.find();
    // const details = await this.modelDetail.find();

    res.status(200).json({
      records,
      views,
      // details,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

getRecordWithUserAndEmployee = async (req, res) => {
  const userId = req.params.userId; // ตรวจสอบและรับค่า userId จากพารามิเตอร์
  console.log(`Params: ${JSON.stringify(req.params)}`); // เพิ่ม console.log เพื่อตรวจสอบค่า params
  console.log(`Received userId: ${userId}`); // เพิ่ม console.log เพื่อตรวจสอบค่า userId

  if (!userId) {
    console.log('User ID is missing');
    return res.status(400).send('User ID is required');
  }

  try {
    const records = await recordModel.find({ userId: userId });
    console.log(`Found records: ${records}`); // เพิ่ม console.log เพื่อตรวจสอบข้อมูลที่ได้จากฐานข้อมูล
    if (records.length === 0) {
      console.log('No records found');
      return res.status(404).send('No records found');
    }
    res.status(200).json({ records });
  } catch (error) {
    console.error('Error in getRecordWithUserAndEmployee function:', error.message);
    res.status(500).send('Server error');
  }
}
    
  }

  
  
  export default recorCon;