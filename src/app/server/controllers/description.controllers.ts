import descriptionModel from "../model/description.model";
import maincon from "../controllers/main.controllers";
import userModel from "../model/user.model";
import * as moment from 'moment';


var ejs = require('ejs');
var html_to_pdf = require('html-pdf-node');

class descrip extends maincon{
    model = descriptionModel;
    
   
    descpdf = async (req, res) => {
  try {
    // ดึงข้อมูลจากฐานข้อมูล
    const des: any = await this.model.findOne({ _id: req.params.id });

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูลหรือสถานะอื่นๆ ที่ต้องการ
    // สมมุติว่า obj1 เป็นข้อมูลจากฐานข้อมูลผู้ใช้
    const userMo: any = await userModel.findOne({ id: des.userId });

    // แปลงวันที่ให้เป็นภาษาไทยและเพิ่ม 543 ปี
    const date = moment(des.date).locale('th').add(543, 'year').format('LL');

    // สร้างข้อมูลที่จำเป็นสำหรับการสร้าง HTML Template
    const data = {
      detail: des.description, 
      userfield: `${userMo.Number_of_times} ${userMo.star_date} ${userMo.end_date} ${userMo.star_date} 
      ${userMo.Rank_Position} ${userMo.name_lname}`, //field user 
      date: date
    };

    // สร้าง HTML ด้วย EJS
    const html = await ejs.renderFile(
      process.cwd() + '/server/form/simple-des.ejs',
      data,
      { async: true }
    );

    // กำหนดตัวเลือกสำหรับ PDF
    const options = {
      height: '21cm', // allowed units: mm, cm, in, px
      width: '29.7cm',
      margin: { left: 25, top: 25, right: 25 },
    };

    // สร้าง PDF จาก HTML
    const file = { content: html };
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);

    // ส่ง PDF กลับเป็น response
    res
      .writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="description.pdf"',
      })
      .end(pdfBuffer);
  } catch (err) {
    res.status(500).send({ success: false, error: err });
  }
};
  }
  
  export default descrip;
