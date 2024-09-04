const express = require('express');
const fs = require('fs');
const path = require('path');
const port = 3000;
const app = express();
const pdfDirectory = 'L:/projectNT/angualr-project-training/src/assets/pdf/';

app.get('/api/pdf-files', (req, res) => {
  fs.readdir(pdfDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err); // เพิ่มการ log ข้อผิดพลาด
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลไฟล์ PDF ได้' });
    }
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    res.json(pdfFiles);
  });
});

app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์กำลังทำงานบนพอร์ต ${port}`);
});