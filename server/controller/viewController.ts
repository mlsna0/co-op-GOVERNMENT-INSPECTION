import recordModel from 'models/recordModel';
import ViewModel from '../models/viewModel';
import BaseCtrl from './base';

class ViewModelCtrl extends BaseCtrl {
    model = ViewModel;

    getViewByRecordId= async (req,res)=>{

      let data = await this.model.find({documentId: req.params.id})
      res.status(200).json(data)
    }
  }
  
  export default ViewModelCtrl;
