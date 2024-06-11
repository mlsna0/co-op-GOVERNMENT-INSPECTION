import ItemModel from '../models/itemModel';
import ViewModel from '../models/viewModel';
import recordModel from '../models/recordModel';
// import DetailModel from 'models/detailModel';
import BaseCtrl from './base';


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
//         const savedDetail = await detail.save();
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
  
}

export default ItemModelCtrl;
