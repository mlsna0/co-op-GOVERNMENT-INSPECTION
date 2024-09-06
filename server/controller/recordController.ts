import recordModel from '../models/recordModel';
import ViewModel from '../models/viewModel';
import RegisterModel from '../models/registerModel'; // เพิ่มการนำเข้า model ของ employee
import User from '../models/userModel'; // เพิ่มการนำเข้า model ของ user
import multer, { StorageEngine } from 'multer';
import { Request, Response } from 'express';
// import DetailModel from 'models/detailModel';
import BaseCtrl from './base';
// import { buffer } from 'stream/consumers';
import * as path from 'path';
import * as fs from 'fs';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
const mongoose = require('mongoose'); 

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
  employeeModel = RegisterModel;
  userModel = User; 
  
  auth = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    // console.log("auth ", token);
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      // console.log("decoded record : ",decoded)
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
  
  postItemToView = async (req, res) => {
    try {
      const userID = req.user.id; // ใช้ userID จาก req.user
      const now = new Date();
      const localDate = now.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' }); // วันที่ตามเขตเวลาท้องถิ่น
      const localTime = now.toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' }); // เวลาตามเขตเวลาท้องถิ่น
      const record_qrcode = req.body.qrCode ? req.body.qrCode.split(',').pop() : null;
      
      const obj = await new this.model({
        record_id: req.body.id,
        record_star_date: req.body.startDate, 
        record_end_date: req.body.endDate,
        record_detail: req.body.detail,
        record_location: req.body.location,
        record_topic: req.body.topic,
        record_content: req.body.content,
        record_provine: req.body.provine,
        record_place: req.body.place,
        record_filename: req.body.filename,
        record_qrcode: record_qrcode, // เก็บเฉพาะชื่อไฟล์ QR Code
        userId: userID, 
        createdDate: localDate, 
        createdTime: localTime, 
        status: 0 // ตั้งค่า status เป็น 0 อัตโนมัติ
      }).save();
  
      if (req.body.personal) {
        let newField = req.body.personal.map(x => { return { view_rank: x.rank, view_first_name: x.firstname, view_last_name: x.lastname, documentId: obj._id }; });
  
        let result = await this.modelView.insertMany(newField);
      }
  
      res.status(200).json("ok");
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  updateStatus = async (req, res) => {
    try {
      const { id } = req.body; // รับ id จาก req.body
  
      // ตรวจสอบว่า id ถูกส่งเข้ามาหรือไม่
      if (!id) {
        return res.status(400).json({ error: "กรุณาส่ง id ที่ต้องการอัปเดต" });
      }
  
      // ตรวจสอบว่า id เป็น ObjectId ที่ถูกต้องหรือไม่
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "id ไม่ถูกต้อง" });
      }
  
      // ค้นหาข้อมูลโดยใช้ _id
      const item = await this.model.findById(id);
  
      // ตรวจสอบว่าพบข้อมูลที่ต้องการหรือไม่
      if (!item) {
        return res.status(404).json({ error: "ไม่พบข้อมูลที่ต้องการอัปเดต" });
      }
  
      // ตรวจสอบว่า status ปัจจุบันเป็น 0 หรือไม่
      if (Number(item.status) !== 0) {
        return res.status(400).json({ error: "status ปัจจุบันไม่ใช่ 0 จึงไม่สามารถเปลี่ยนเป็น 1 ได้" });
      }
  
      // อัปเดต status เป็น 1
      item.status = 1;
      await item.save();
  
      // ส่งข้อความยืนยันการอัปเดตสำเร็จ
      res.status(200).json({ message: "อัปเดต status สำเร็จ", updatedItem: item });
    } catch (err) {
      // จัดการกับข้อผิดพลาดและส่งข้อความตอบกลับ
      return res.status(400).json({ error: err.message });
    }
  }

updateRecordContent = async (req, res) => {
// console.log("Updating record content: ", req.body);
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
// console.log('savePDF');

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
      // console.error('Error writing PDF file:', err);
      return res.status(500).send('Failed to save PDF');
    }

    try {
      const qrCodeDataURL = await QRCode.toDataURL(`http://localhost:4200/table-detail/${id}`);

      const record = await this.model.findByIdAndUpdate(id, { record_filename: newFilename ,
        qr_code: qrCodeDataURL}, { new: true });
      if (!record) {
        return res.status(404).send('Record not found');
      }
      res.status(200).json(record);
    } catch (err) {
      // console.error('Error updating record in database:', err);
      res.status(500).send('Error updating record in database');
    }
  }); 
});
}

updateDataDocument = async (req, res) => {
  try {
    const documentId = req.params.id; // Getting the document _id from the URL
    const updatedData = req.body; // Getting the updated data from the request body

    console.log("_id Document?: ", documentId);
    console.log("Edit data: ", updatedData);



    // Update the document in the database using Mongoose
    const updatedDocument = await this.model.findOneAndUpdate(
      { _id: documentId }, 
      {
        record_id: updatedData?.id,
        record_star_date: updatedData?.startDate,
        record_end_date: updatedData?.endDate,
        record_detail: updatedData?.detail,
        record_location: updatedData?.location,
        record_topic: updatedData?.topic,
        // record_content: updatedData?.content,
        // record_filename: updatedData?.filename,
        record_place: updatedData?.place,
        // personal: personal // กรณีต้องการอัปเดต personal array ด้วย
      },
      { new: true } // return the updated document
    );

    if (!updatedDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }
      // อัปเดตข้อมูลในคอลเล็กชัน `personal`
      if (updatedData.personal && Array.isArray(updatedData.personal)) {
        for (const person of updatedData.personal) {
          if (person._id) {
            await this.modelView.findOneAndUpdate(
              { documentId: documentId, _id: person._id }, // Find by documentId and _id
              {
                view_rank: person.rank,
                view_first_name: person.firstname,
                view_last_name: person.lastname,
              },
              { new: true }
            );
          } else {
            // If _id does not exist, add new personal record
            await this.modelView.create({
              view_rank: person.rank,
              view_first_name: person.firstname,
              view_last_name: person.lastname,
              documentId: documentId // Link with the main document's _id
            });
          }
        }
      }

    res.status(200).json({ message: 'Document updated successfully!', data: updatedDocument });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



getPDF = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send('Invalid ID');
    return;
  }
  const filePath = path.join(__dirname, '../img', `${id}.pdf`); // Updated path to dist\server\img

  res.sendFile(filePath, (err) => {
    if (err) {
      // console.error('Error sending PDF file:', err);
      res.status(500).send('Error sending PDF file');
    }
  });
}
postDataTest = async (req,res)=>{
  // console.log("body : ",req.body)
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

getAllRecordsLinkedByEmployeeId = async (req, res) => {
  try {
    const users = await this.userModel.find({});
    const employees = await this.employeeModel.find({});
    const documents = await this.model.find({});

    const linkedData = users.map(user => {
      const employee = employees.find(emp => emp._id.toString() === user.employeeId.toString());
      const userDocuments = documents.filter(doc => doc.userId.toString() === user._id.toString());

      return {
        user,
        employee: employee || null,
        documents: userDocuments
      };
    });

    res.status(200).json(linkedData);
  } catch (error) {
    res.status(500).send('Server error');
  }
};


getRecordByDocumentId =async (req,res)=>{
  try {
    const documentId = req.params.id;

    // ดึงข้อมูล document จากฐานข้อมูลตาม documentId
    const document = await this.model.findById(documentId).exec();

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // ดึงข้อมูลผู้ใช้และพนักงานตามที่ต้องการ
    const user = await this.userModel.findById(document.userId).exec();
    const employee = user ? await this.employeeModel.findById(user.employeeId).exec() : null;

    // ส่งข้อมูลที่ต้องการกลับไปยัง client
    res.status(200).json({
      document: {
        documentId: document._id,
        record_topic: document.record_topic,
        createdDate: document.createdDate,
        createdTime: document.createdTime,
        record_star_date: document.record_star_date,
        
      },
      user: {
        role: user ? user.role : 'N/A'
      },
      employee: {
        firstname: employee ? employee.firstname : 'N/A',
        lastname: employee ? employee.lastname : 'N/A',
        email: employee ? employee.email : 'N/A'
      }
    });
  } catch (error) {
    // console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server error' });
  }

};


getRecordWithUserAndEmployee = async (req, res) => {
  const userId = req.params.userId;
  // console.log(`Params: ${JSON.stringify(req.params)}`);
  // console.log(`Received userId: ${userId}`);

  if (!userId) {
    // console.log('User ID is missing');
    return res.status(400).send('User ID is required');
  }

  try {
    const documents = await this.model.find({ userId: userId });
    // console.log(`Found documents: ${documents}`);
    if (documents.length === 0) {
      // console.log('No documents found');
      return res.status(404).send('No documents found');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      // console.log('User not found');
      return res.status(404).send('User not found');
    }

    // ส่งคืนเฉพาะ user และ documents
    res.status(200).json({ user, documents });
  } catch (error) {
    // console.error('Error in getRecordWithUserAndDocument function:', error.message);
    res.status(500).send('Server error');
  }
}
getAllPDFs = async (req, res) => {
  try {
    // กำหนด path ของไดเรกทอรีที่เก็บไฟล์ PDF
    const directoryPath = path.join(__dirname, '../../server/img');

    // console.log(`Path: ${directoryPath}`);
    // อ่านไฟล์ทั้งหมดในไดเรกทอรี
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        // console.error('Error reading directory:', err);
        return res.status(500).send('Failed to read directory');
      }
      // L:\projectNT\angualr-project-training\dist\server\img
      // กรองเฉพาะไฟล์ที่มีนามสกุล .pdf
      const pdfFiles = files.filter(file => path.extname(file) === '.pdf');

      if (pdfFiles.length === 0) {
        return res.status(404).send('No PDF files found');
      }

      // ส่งกลับรายการไฟล์ PDF ทั้งหมด
      res.status(200).json(pdfFiles);
    });
  } catch (err) {
    // console.error('Error fetching PDF files:', err);
    res.status(500).send('Failed to fetch PDF files');
  }
}
    
  }

  
  
  export default recorCon;