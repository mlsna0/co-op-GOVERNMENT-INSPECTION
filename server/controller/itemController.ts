import ItemModel from '../models/itemModel';
import BaseCtrl from './base';

class ItemModelCtrl extends BaseCtrl {
  model = ItemModel;

  getAll = async (req, res) => {
    try {
      const obj = await new this.model({
        times: 2,
        startDate: new Date(),
        endDate: new Date(),
        location: "Some si",
        task: "Some Ta",
        rank: "Some Ra",
        fullName: "John Doees",
        details: "Some details  task"
      }).save();
      
      console.log("OBJ: ", obj);
      res.status(200).json("ok");
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default ItemModelCtrl;
