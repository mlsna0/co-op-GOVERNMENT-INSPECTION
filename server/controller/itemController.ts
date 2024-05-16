import ItemModel from '../models/itemModel';
import BaseCtrl from './base';

class ItemModelCtrl extends BaseCtrl {
  model = ItemModel;

  getAlltest = async (req, res) => {
    try {
      console.log("OK")
      res.status(200).json("ok");
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

}

export default ItemModelCtrl;