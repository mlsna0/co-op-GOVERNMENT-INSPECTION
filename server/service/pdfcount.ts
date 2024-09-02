// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const port = 3000;
// const app = express();
// const pdfDirectory = path.join(__dirname, 'L:/projectNT/angualr-project-training/src/assets/pdf');  // ตรวจสอบว่าเส้นทางนี้ถูกต้องตามโปรเจกต์ของคุณ

// app.get('/api/pdf-files', (req, res) => {
//   fs.readdir(pdfDirectory, (err, files) => {
//     if (err) {
//       return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลไฟล์ PDF ได้' });
//     }
//     // ส่งเฉพาะไฟล์ที่มีนามสกุล .pdf
//     const pdfFiles = files.filter(file => file.endsWith('.pdf'));
//     res.json(pdfFiles);
//   });
// });

// app.listen(3000, () => {
//   console.log('เซิร์ฟเวอร์กำลังทำงานบนพอร์ต 3000');
// });
