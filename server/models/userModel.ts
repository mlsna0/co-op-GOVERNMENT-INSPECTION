// import * as mongoose from 'mongoose';


// var Schema = mongoose.Schema;
// const userSchema = new mongoose.Schema({
//     rank: String,
//     star_date: String,
   
// });

// const userModel = mongoose.model('userModel', userSchema);
// export interface AnnoucementModel {
//     rank: String,
//     fullname: String,
  
//   }
// export default userModel;


import { Schema, model, Document } from 'mongoose';

interface user extends Document {
  rank: string;
  full_name: string;
 
}

const userSchema = new Schema<user>({
  rank: { type: String, required: true },
  full_name: { type: String, required: true },
 
});

const userMo = model<user>('userMo', userSchema);
export default userMo;
export type { user };
