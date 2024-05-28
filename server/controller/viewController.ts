import recordModel from 'models/recordModel';
import ViewModel from '../models/viewModel';
import BaseCtrl from './base';

class userCon extends BaseCtrl {
    model = ViewModel;

    getViewByRecordId= async (req,res)=>{

      let data = await this.model.find({RecordModelId: req.params.id})
      res.status(200).json(data)
    }
      
   
  }
  
  export default userCon;