import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'admin', 'superadmin'], default: 'user' },

    RegisterModelId: { type: mongoose.Schema.Types.ObjectId, ref: 'registerModel' }
   
});

const userModel = mongoose.model('userModel', userSchema);
export default userModel;


// import { Schema, model, Document } from 'mongoose';

// interface user extends Document {
//   rank: string;
//   full_name: string;
 
// }

// const userSchema = new Schema<user>({
//   rank: { type: String, required: true },
//   full_name: { type: String, required: true },
 
// });

// const userMo = model<user>('userMo', userSchema);
// export default userMo;
// export type { user };
