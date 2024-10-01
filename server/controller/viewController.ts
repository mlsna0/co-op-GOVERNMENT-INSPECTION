import recordModel from '../models/recordModel';
import ViewModel from '../models/viewModel';
import BaseCtrl from './base';
const fs = require('fs');
const path = require('path');

class ViewModelCtrl extends BaseCtrl {
    recordModel = recordModel;
    model = ViewModel;

    getViewByRecordId= async (req,res)=>{

      let data = await this.model.find({documentId: req.params.id})
      res.status(200).json(data)
    }

   
    saveSignatureToFile = async (req, res) => {
      const documentId = req.params.documentId; // Correct route usage
      const { personId, signature } = req.body;
      console.log("saveSignatureToFile id", documentId);
  
      // Check if signature is provided and is in the correct format
      if (!signature || !signature.startsWith('data:image/png;base64,')) {
          return res.status(400).json({ success: false, message: "ข้อมูลลายเซ็นไม่ถูกต้อง" });
      }
  
      // Create a unique file name
      const fileName = `signature_${personId}_${Date.now()}.png`; // Correct usage of template literals
  
      // Define the directory path for storing signatures
      const signaturesDir = path.join(__dirname, '..', 'signaturesDetail'); // Update the directory path as needed
  
      // Check if the directory exists, create it if not
      if (!fs.existsSync(signaturesDir)) {
          fs.mkdirSync(signaturesDir, { recursive: true }); // Create the directory if it doesn't exist
      }
  
      // Create the file path
      const filePath = path.join(signaturesDir, fileName); // Use the new path
  
      // Convert the base64 string to a buffer
      const base64Data = signature.replace(/^data:image\/png;base64,/, ""); // Remove the header
      const buffer = Buffer.from(base64Data, 'base64');
  
      try {
          // Save the file
          await fs.promises.writeFile(filePath, buffer);
  
          // Save the file name in the database
          const updateResult = await this.model.updateOne(
            { documentId: documentId, _id: personId }, // ตรวจสอบว่ามีเอกสารที่มีทั้ง documentId และ personId ตรงกันหรือไม่
            { $set: { signature: fileName } } // ถ้ามีเอกสารตรงกัน, อัปเดตฟิลด์ signature ด้วยค่าใหม่ (fileName)
        );
  
          // Check if the database update was successful
          if (updateResult.modifiedCount > 0) {
              return res.status(200).json({ success: true, message: `ไฟล์ถูกบันทึกที่: ${filePath}` });
          } else {
              return res.status(404).json({ success: false, message: "ไม่พบข้อมูลผู้ใช้ที่ต้องการอัปเดต" });
          }
      } catch (error) {
          console.error("Error saving signature:", error);
          return res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในการบันทึกลายเซ็น" });
      }
  };
  }

  
  export default ViewModelCtrl;
