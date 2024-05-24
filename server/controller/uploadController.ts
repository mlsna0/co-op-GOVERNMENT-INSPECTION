import { Request, Response } from 'express';
import html_to_pdf from 'html-pdf-node';
import ejs from 'ejs';
import recordModel from '../models/recordModel';
import ItemModel from '../models/itemModel';


class recordCtrl {

  model = recordModel;

  // ดึงข้อมูลใบลา
  getRecordModels = async (req: Request, res: Response) => {
    try {   
      const obj = await this.model.find({}).populate({
        //ไม่เเน่ใจ  path model
        path: 'recordModel',
        model: recordModel,
      }).populate({
        path: 'recordModel',
        model: recordModel,

      }).sort({ created_at: -1 });
      res.status(200).json(obj);
    } catch (error) {
      return res.status(500).json(error);
    }
  };

  // ดึงข้อมูลใบลาตาม ID
  getRecordModelByID = async (req: Request, res: Response) => {
    try {
      const obj = await this.model.findOne({ _id: req.params.id }).populate({

        path: 'recordModel',
        model: recordModel,
      }).populate({
        path: 'recordModel',
        model: recordModel,
      });
      res.status(200).json(obj);
    } catch (error) {
      return res.status(500).json(error);
    }
  };

  // ปริ้น PDF
  printPDF = async (req: Request, res: Response) => {
    try {
      const obj = await this.model.findOne({ _id: req.params.id });
      if (!obj) {
        return res.status(404).json({ error: 'Record not found' });
      }

      const options = {
        height: '29.7cm',
        width: '21cm',
        margin: { left: 25, top: 25, right: 25 },
      };

      const html = await ejs.renderFile(
        process.cwd() + '/server/form/petition.ejs',
        { data: obj },
        { async: true }
      );

      const file = { content: html };

      html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline',
        }).end(pdfBuffer);
      }).catch((err) => {
        res.status(500).send({ success: false, error: err.message });
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
}

export default recordCtrl;
