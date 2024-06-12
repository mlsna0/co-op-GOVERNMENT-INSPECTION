import recordModel from 'models/recordModel';
import noteModel from 'models/noteModel';
import BaseCtrl from './base';

class NoteModelCtrl extends BaseCtrl {
    model = noteModel;

    getNoteByRecordId= async (req,res)=>{

      let data = await this.model.find({RecordModelId: req.params.id})
      res.status(200).json(data)
    }

  }  
export default NoteModelCtrl;
