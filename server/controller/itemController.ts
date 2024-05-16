import ItemModel from '../models/itemModel';
import BaseCtrl from './base';

class ItemModelCtrl extends BaseCtrl {
  model = ItemModel;

  getAlltest = async (req, res) => {
    try {
      const obj = await new this.model({
        name: "test",
        country: "test",
        city: "test",
        salary: 200
      }).save()
      console.log("OBJ : ",obj)
      
      res.status(200).json("ok");
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

}

export default ItemModelCtrl;