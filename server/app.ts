import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import setMongo from './mongo';  // Import the setMongo function
import setRoutes from './routes';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Define the Item schema and model

// const ItemSchema = new mongoose.Schema({
//   name: String,
//   country: String,
//   city: String,
//   salary: Number
// });

// const Item = mongoose.model('Item', ItemSchema);

// // Define routes
// app.get('/items', async (req, res) => {
//   try {
//     const items = await Item.find();
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post('/items', async (req, res) => {
//   try {
//     const newItem = new Item(req.body);
//     await newItem.save();
//     res.status(201).json(newItem);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// app.put('/items/:id', async (req, res) => {
//   try {
//     const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedItem) {
//       return res.status(404).json({ error: 'Item not found' });
//     }
//     res.json(updatedItem);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// app.delete('/items/:id', async (req, res) => {
//   try {
//     const deletedItem = await Item.findByIdAndDelete(req.params.id);
//     if (!deletedItem) {
//       return res.status(404).json({ error: 'Item not found' });
//     }
//     res.sendStatus(204);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

async function main(): Promise<void> {
  const app = express();

  try {
    await setMongo(); 
    setRoutes(app);   
  } catch (err) {
    console.error(err);
  }
  app.set('port', (3000));
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main().catch(console.error);
