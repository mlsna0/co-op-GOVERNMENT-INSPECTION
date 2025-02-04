import recordModel from '../models/recordModel';
import ViewModel from '../models/viewModel';
import RegisterModel from '../models/registerModel'; // เพิ่มการนำเข้า model ของ employee
import User from '../models/userModel'; // เพิ่มการนำเข้า model ของ user
import Agency from "../models/agencyModel";
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
  agencyModel = Agency;

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
      const { id } = req.params;
      const { status } = req.body; // รับค่า status จาก body

      // console.log("ID ที่ได้รับ:", id);

      if (!id) {
        return res.status(400).json({ error: "กรุณาส่ง id ที่ต้องการอัปเดต" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "id ไม่ถูกต้อง" });
      }

      const item = await this.model.findById(id);

      if (!item) {
        return res.status(404).json({ error: "ไม่พบข้อมูลที่ต้องการอัปเดต" });
      }

      // เปรียบเทียบ item.status และ status โดยครอบคลุมทั้งกรณีสตริงและตัวเลข
      if (String(item.status) === "0" || String(item.status) === "2") {
        // อนุญาตให้เปลี่ยนเป็น 1 ได้
        // คุณสามารถใส่โค้ดเพื่อเปลี่ยนสถานะตรงนี้
        item.status = "1";
      } else {
        // ถ้าไม่ใช่ 0 หรือ 2 ให้แสดงข้อความ error
        return res.status(400).json({ error: "status ปัจจุบันไม่ใช่ 0 หรือ 2 จึงไม่สามารถเปลี่ยนเป็น 1 ได้" });
      }
      // ตรวจสอบ status ว่าเป็น "1" หรือ "2" โดยครอบคลุมทั้งกรณีที่เป็นสตริงหรือจำนวนเต็ม
      if (status !== "1" && status !== "2" && status !== 1 && status !== 2) {
        return res.status(400).json({ error: "สถานะที่ต้องการอัปเดตต้องเป็น 1 หรือ 2" });
      }

      item.status = status; // เปลี่ยนเป็น status ที่ส่งเข้ามา
      await item.save();

      res.status(200).json({ message: "อัปเดต status สำเร็จ", updatedItem: item });
    } catch (err) {
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

          const record = await this.model.findByIdAndUpdate(id, {
            record_filename: newFilename,
            qr_code: qrCodeDataURL
          }, { new: true });
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
  postDataTest = async (req, res) => {
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
      records.sort((a: any, b: any) => { return b.record_id - a.record_id })
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
//////ทดลอง
async getAllRecordsWithEmployees(req: Request, res: Response): Promise<void> {
  try {
    // ดึงข้อมูลพนักงานทั้งหมด
    const employees = await RegisterModel.find().exec();
    if (!employees.length) {
      res.status(404).send('No employees found.');
      return;
    }

    // ดึงข้อมูลเอกสารทั้งหมด
    const allRecords = await recordModel.find().exec();
    if (!allRecords.length) {
      res.status(404).send('No records found.');
      return;
    }

    // ดึงข้อมูลที่มี employee และเชื่อมโยงกับ agency และ records
    const result = await Promise.all(allRecords.map(async (record) => {
      const recordUser = await User.findById(record.userId).exec();
      if (!recordUser) return null;

      const employee = await RegisterModel.findById(recordUser.employeeId).exec();
      if (!employee) return null;

      const agency = await Agency.findById(employee.agencies).exec();
      if (!agency) return null;

      // จัดรูปแบบข้อมูลให้ตรงตามที่ต้องการ
      return {
        // user: recordUser,   // ข้อมูลผู้ใช้
        // employee: employee,  // ข้อมูลพนักงาน
        // documents: [],      // ปรับตามที่คุณต้องการ (หรือสามารถเก็บเอกสารได้ที่นี่)
        agency: agency,     // ข้อมูลหน่วยงาน
        status: record.status // เพิ่ม status ของเอกสาร
      };
    }));

    // กรองค่า null ออกจากผลลัพธ์
    const filteredResult = result.filter(item => item !== null);

    if (!filteredResult.length) {
      res.status(404).send('No records found.');
      return;
    }

    // Grouping the results by province
    const groupedByProvince: { [key: string]: any } = {};

    for (const record of filteredResult) {
      const province = record.agency.province; // สมมติว่า agency มีฟิลด์ province
      if (!groupedByProvince[province]) {
        groupedByProvince[province] = {
          province: province,
          agenciesCount: 0,
          documentCount: 0, // เพิ่ม documentCount
          signedCount: 0,
          unsignCount: 0,
          onProcessCount: 0,
          records: []
          
        };
      }
      groupedByProvince[province].agenciesCount += 1; // เพิ่มจำนวนหน่วยงาน
      groupedByProvince[province].documentCount += 1; // นับเอกสารในจังหวัด
      groupedByProvince[province].records.push(record); // เพิ่มเอกสารใน province นั้น

      // นับจำนวนการเซ็นตาม status
      switch (record.status) {
        case "0": // unsigned
          groupedByProvince[province].unsignCount += 1;
          break;
        case "1": // signed
          groupedByProvince[province].signedCount += 1;
          break;
        case "2": // onProcess
          groupedByProvince[province].onProcessCount += 1;
          break;
        default:
          break;
      }
    }

    // เปลี่ยนให้เป็นอาร์เรย์เพื่อส่งกลับ
    const finalResult = Object.values(groupedByProvince);

    // ส่งผลลัพธ์ทั้งหมดกลับไปให้หน้าบ้าน
    res.send(finalResult);
  } catch (error) {
    console.error('Error retrieving all records with employees:', error);
    res.status(500).send('Server error.');
  }
}
//////////////////////////////////////////////////////////////////
  getAllRecordsLinkedByEmployeeId = async (req, res) => {
    try {
      // ดึง users, employees และ documents มา
      const users = await this.userModel.find({});
      const employees = await this.employeeModel.find({}).populate('agencies'); // ใช้ populate เพื่อดึงข้อมูล Agency
      const documents = await this.model.find({});

      const linkedData = users.map(user => {
        // หา employee ที่ตรงกับ employeeId ใน user
        const employee = employees.find(emp => emp._id.toString() === user.employeeId.toString());
        const userDocuments = documents.filter(doc => doc.userId.toString() === user._id.toString());

        return {
          user,
          employee: employee || null, // ถ้าไม่มี employee ก็ให้เป็น null
          documents: userDocuments,
          agency: employee ? employee.agencies : null // เพิ่มข้อมูล agencies ของ employee ถ้ามี
        };
      });

      res.status(200).json(linkedData);
    } catch (error) {
      res.status(500).send('Server error');
    }
  }
  getUserDocuments = async (req, res) => {
    try {
      const userId = req.user.id; // ดึง userId จาก req.user หลังจากการผ่าน auth middleware

      // ตรวจสอบว่ามี userId หรือไม่
      if (!userId) {
        return res.status(400).json({ error: 'User ID is missing' });
      }

      // ค้นหา documents ที่ userId ตรงกับ user ที่ล็อกอินอยู่
      const userDocuments = await this.model.find({ userId });

      // ตรวจสอบว่าเจอ documents หรือไม่
      if (!userDocuments || userDocuments.length === 0) {
        return res.status(404).json({ message: 'No documents found for this user' });
      }

      // ส่งคืน documents ที่เจอ
      res.status(200).json(userDocuments);
    } catch (error) {
      console.error('Error fetching user documents:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRecordWithSameOrganization(req: Request, res: Response): Promise<void> {
    try {
      // แก้ไขการดึงค่า id ให้ตรงกับ type ที่ต้องการ
      const { id: currentUserId } = req.params;
      // console.log("Current User ID:", currentUserId);

      if (!currentUserId) {
        res.status(400).send('Current User ID is required.');
        return;
      }

      // ดึงข้อมูลผู้ใช้ที่ตรงกับ currentUserId ถ้าใช้แบบ this. มันจะหาคุณสมบัติไม่เจออะ
      const currentUser = await User.findById(currentUserId).exec();
      // console.log("Current User:", currentUser);

      if (!currentUser) {
        res.status(404).send('User not found.');
        return;
      }

      // ดึงข้อมูลพนักงานที่เชื่อมโยงกับ currentUser  ถ้าใช้แบบ this. มันจะหาคุณสมบัติไม่เจออะ
      const currentEmployee = await RegisterModel.findById(currentUser.employeeId).exec();
      // console.log("Current Employee:", currentEmployee);

      if (!currentEmployee) {
        res.status(404).send('Employee not found.');
        return;
      }

      // ดึง agencyId ของ currentEmployee 
      const agencyId = currentEmployee.agencies;
      // console.log("Agency ID:", agencyId);

      // ดึงข้อมูลพนักงานที่เชื่อมโยงกับ agencyId  ถ้าใช้แบบ this. มันจะหาคุณสมบัติไม่เจออะ
      const employees = await RegisterModel.find({ agencies: agencyId }).exec();
      // console.log("Employees under the same agency:", employees);

      if (!employees.length) {
        res.status(404).send('No employees found for the provided agency.');
        return;
      }

      // สร้างอาร์เรย์ของ userIds โดยใช้ employeeId จาก employees
      const userIds = await Promise.all(employees.map(async (emp) => {
        const user = await User.findOne({ employeeId: emp._id }).exec();
        return user ? user._id : null; // หากพบให้เก็บ _id, ไม่พบให้เก็บ null
      }));

      // กรอง null ออกจาก userIds
      const filteredUserIds = userIds.filter(id => id !== null);
      // console.log("User IDs:", filteredUserIds);

      // ดึงข้อมูล records ที่สร้างโดย userIds
      const records = await recordModel.find({ userId: { $in: filteredUserIds } }).exec();
      // console.log("Records:", records);

      const result = await Promise.all(records.map(async (record) => {
        // console.log("Result Record Created By ID:", record.userId);

        const recordUser = await User.findById(record.userId).exec();
        // console.log(" recordUser",recordUser)
        if (!recordUser) {
          console.log(`No employee found for createdBy: ${record.userId}`);
          // console.log(`record recordUserdata : ${record}`);
        }

        const recordEmployee = recordUser ? await RegisterModel.findById(recordUser.employeeId).exec() : null;
        if (!recordEmployee) {
          console.log(`No user found for employee recordEmployee ID: ${recordEmployee ? recordEmployee._id : 'N/A'}`);
        }

        // const view = await ViewModel.findOne({ recordId: record._id }).exec();
        // if (!view) {
        //   console.log(`No view found for record ID: ${record._id}`);
        // }

        return {
          record,
          employee: recordEmployee,
          user: recordUser,
          // view
        };
      }));

      res.send(result);
    } catch (error) {
      console.error('Error retrieving records with the same organization:', error);
      res.status(500).send('Server error.');
    }
  }




  getRecordByDocumentId = async (req, res) => {
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