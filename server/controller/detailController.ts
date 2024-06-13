import recordModel from 'models/recordModel';
import DTModel from '../models/detailModel';
import BaseCtrl from './base';

class userCon extends BaseCtrl {
    model = DTModel;

    // getViewByRecordId= async (req,res)=>{

    //   let data = await this.model.find({RecordModelId: req.params.id})
    //   res.status(200).json(data)
    // }
      
   
  }
  
  export default userCon;
