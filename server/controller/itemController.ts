import ItemModel from '../models/itemModel';
import ViewModel from '../models/viewModel';
import recordModel from '../models/recordModel';
import multer, { StorageEngine } from 'multer';
import { Request, Response } from 'express';
// import DetailModel from 'models/detailModel';
import BaseCtrl from './base';
import { buffer } from 'stream/consumers';
import * as path from 'path';
import * as fs from 'fs';


interface MulterRequest extends Request {
  file: Express.Multer.File;
}


const storage: StorageEngine = multer.memoryStorage();
const upload = multer({ storage: storage }).single('pdf');

class ItemModelCtrl extends BaseCtrl {
  model = ItemModel;
  modelView = ViewModel;
  modelRecord = recordModel;
  // modelDetail = DetailModel

  
    postItemToView = async (req, res) => {
      console.log(req.body);
      
      try {
        const obj = await new this.modelRecord({
          record_id: req.body.id,
          record_star_date: req.body.startDate,
          record_end_date: req.body.endDate,
          record_detail: req.body.detail,
          record_location: req.body.location,
          record_topic: req.body.topic,
          record_content: req.body.content,
          // pdfs: [
          //   {
              record_filename: req.body.filename,
          //     record_data_: Buffer.from(req.body.data_, 'base64'),
          //     record_contentType: req.body.contentType
          //   }
          // ]
    
        }).save();
        // req.body.personal.forEach(async (element) => {
        //   const obj1 = await new this.modelView({
        //     view_rank: element.rank,
        //     view_full_name: element.fullname,
        //   }).save();
        // });
        console.log("obj _Id: ",obj._id)
        if(req.body.personal){ 
          let newField = req.body.personal.map( x=> {return { view_rank : x.rank, view_full_name: x.fullname,RecordModelId: obj._id }});

          let result = await this.modelView.insertMany(newField)
        }
        

        res.status(200).json("ok");
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }
  
//   addDetail = async (req, res) => {
//     console.log("Adding detail: ", req.body);
//     try {
//         const detail = new this.modelDetail({
//             detail_dt: req.body.detail_dt,
//             RecordModelId: req.body.RecordModelId
//         });
//         const savedDetai  l = await detail.save();
//         res.status(201).json(savedDetail);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// }

updateRecordContent = async (req, res) => {
  console.log("Updating record content: ", req.body);
  try {
    const { id, content } = req.body;
    const record = await this.modelRecord.findByIdAndUpdate(id, { record_content: content }, { new: true });
    if (!record) {
      res.status(404).send('Record not found');
    } else {
      res.status(200).json(record);
    }
  } catch (err) {
    res.status(500).send('Error updating record');
  }
}
// updateRecordPDF = async (req, res) => {
//   console.log("Updating record PDD: ", req.body);
//   try {
//     const { id, filename , data_ ,contentType } = req.body;
//     const record = await this.modelRecord.findByIdAndUpdate(id, { record_filename: filename ,record_data_: data_ ,record_contentType: contentType }, { new: true });
//     if (!record) {
//       res.status(404).send('Record not found');
//     } else {
//       res.status(200).json(record);
//     }
//   } catch (err) {
//     res.status(500).send('Error updating record');
//   }
// }

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
        const record = await this.modelRecord.findByIdAndUpdate(id, { record_filename: newFilename }, { new: true });
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

  // getAll = async (req, res) => {
  //   try {
  //     // Create record object
  //     const record = await new this.modelRecord({
  //       record_id: req.body.id,
  //       record_star_date: req.body.startDate,
  //       record_end_date: req.body.endDate,
  //       record_detail: req.body.detail,
  //       record_location: req.body.location,
  //       record_topic: req.body.topic,
  //     }).save();
  
  //     // Create view object
  //     const view = await new this.modelView({
  //       view_rank: req.body.rank,
  //       view_full_name: req.body.fullName,
  //     }).save();
  
  //     res.status(201).json({ message: 'Data added successfully' });
  //   } catch (err) {
  //     res.status(400).json({ error: err.message });
  //   }
  // }
  getData = async (req, res) => {
    try {
      const records = await this.modelRecord.find();
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
  
  // getPDF = async (req: Request, res: Response) => {
  //   try {
  //     const { id, pdfIndex } = req.params;
  //     const record = await this.modelRecord.findById(id);

  //     if (!record || !record.pdfs[pdfIndex]) {
  //       return res.status(404).send('File not found');
  //     }

  //     const pdf = record.pdfs[pdfIndex];
  //     res.contentType(pdf.contentType);
  //     res.send(pdf.data);
  //   } catch (err) {
  //     res.status(500).send('Internal Server Error');
  //   }
  // };

  
}

export default ItemModelCtrl;
