import * as mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  salary: { type: Number, required: true }
});

const Items = mongoose.model('items', itemSchema);

export interface ItemModel {
  name: String;
  country: String;
  city: String;
  salary: Number;
}

export default Items;
