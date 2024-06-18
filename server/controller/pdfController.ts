// import { Request, Response } from 'express';
// import multer from 'multer';
// import PDF from '../models/pdfModel';
// import recordModel from '../models/recordModel'; // Import the Record model
// import BaseCtrl from './base';

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage }).single('pdf');

// class PdfCtrl  {
//     uploadPDF = (req: Request, res: Response) => {
//         upload(req, res, async (err) => {
//             if (err) {
//                 return res.status(500).json({ success: false, error: err.message });
//             }

//             try {
//                 const recordId = req.body.recordId;
                
//                 // ตรวจสอบว่า recordId ถูกต้องหรือไม่
//                 const record = await Record.findById(recordId);
//                 if (!record) {
//                     return res.status(404).json({ success: false, error: 'Record not found' });
//                 }

//                 const newPDF = new PDF({
//                     filename: req.file.originalname,
//                     data: req.file.buffer,
//                     contentType: req.file.mimetype,
//                     recordId: recordId // เชื่อมโยงกับ Record
//                 });

//                 const savedPDF = await newPDF.save();
//                 res.json({ success: true, fileUrl: `/pdf/${savedPDF._id}`, id: savedPDF._id });
//             } catch (err) {
//                 res.status(500).json({ success: false, error: err.message });
//             }
//         });
//     };

//     getPDF = async (req: Request, res: Response) => {
//         try {
//             const pdf = await PDF.findById(req.params.id);
//             if (!pdf) {
//                 return res.status(404).send('File not found');
//             }
//             res.contentType(pdf.contentType);
//             res.send(pdf.data);
//         } catch (err) {
//             res.status(500).send('Internal Server Error');
//         }
//     };
// }

// export default PdfCtrl;