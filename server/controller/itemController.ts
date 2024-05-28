import ItemModel from '../models/itemModel';
import ViewModel from '../models/viewModel';
import recordModel from '../models/recordModel';
import BaseCtrl from './base';
import Items from '../models/itemModel';


class ItemModelCtrl extends BaseCtrl {
  model = ItemModel;
  modelView = ViewModel;
  modelRecord = recordModel

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
  
      }).save();
      // req.body.personal.forEach(async (element) => {
      //   const obj1 = await new this.modelView({
      //     view_rank: element.rank,
      //     view_full_name: element.fullname,
      //   }).save();
      // });
      
      if(req.body.personal){ 
        let newField = req.body.personal.map( x=> {return { view_rank : x.rank, view_full_name: x.fullname }})
        let result = await this.modelView.insertMany(newField)
      }
      

      res.status(200).json("ok");
    } catch (err) {
      return res.status(400).json({ error: err.message });
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
     
      res.status(200).json({
        records,  
        views,
      
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

}

export default ItemModelCtrl;

