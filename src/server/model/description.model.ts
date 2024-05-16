import * as mongoose from 'mongoose';
var Schema = mongoose.Schema;
const descripotionSchema = new mongoose.Schema({
    description : String,

});

const descriptionModel = mongoose.model('descriptionModel', descripotionSchema);
export interface AnnoucementModel {
    description: String,
   
  }
export default descriptionModel;
