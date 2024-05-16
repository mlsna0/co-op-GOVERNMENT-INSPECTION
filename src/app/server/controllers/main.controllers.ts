abstract class maincon {

    abstract model: any;
  
    // Get 
    getAll = async (req, res) => {
      try {
        const docs = await this.model.find({});
        res.status(200).json(docs);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    // Insert
    insert = async (req, res) => {
      console.log(req.body)
      try {
        const obj = await new this.model(req.body).save();
        res.status(201).json(obj);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }
  
    // Get by id
    get = async (req, res) => {
      try {
        const obj = await this.model.findOne({ _id: req.params.id });
        res.status(200).json(obj);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
  
    // Update by id
    update = async (req, res) => {
      try {
        await this.model.findOneAndUpdate({ _id: req.params.id }, req.body);
        res.status(200).json({ message: 'success' });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }
  
    // // Delete by id
    // delete = async (req, res) => {
    //   try {
    //     await this.model.findOneAndRemove({ _id: req.params.id });
    //     res.status(200).json({ message: 'success' });
    //   } catch (err) {
    //     return res.status(400).json({ error: err.message });
    //   }
    // }
  }
  
  export default maincon;
  