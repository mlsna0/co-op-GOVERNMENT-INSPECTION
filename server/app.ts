import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import setMongo from './mongo';  // Import the setMongo function
import setRoutes from './routes';
import * as path from 'path';


const app = express();
app.use(cors());
// app.use(bodyParser.json());

app.use(express.json());  
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use('/img', express.static(path.join(__dirname, './img')));

app.use('/', express.static(path.join(__dirname, '../public')));
require('dotenv').config();
app.use((req, res, next) => {
req.headers['content-type'] = req.headers['content-type'] || 'application/json; charset=utf-8' || 'text/csv; charset=utf-8';
res.header("Access-Control-Allow-Origin", "*");
res.header(
  "Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
);    
if (req.method === 'OPTIONS') {
  res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
  return res.status(200).json({});
}   
next();
});


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



// document.addEventListener('DOMContentLoaded', () => {
//   const personForm = document.getElementById('personForm') as HTMLFormElement;
//   const recordForm = document.getElementById('recordForm') as HTMLFormElement;
//   const personsList = document.getElementById('personsList') as HTMLUListElement;
//   const recordsList = document.getElementById('recordsList') as HTMLUListElement;

//   personForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const rank = (document.getElementById('rank') as HTMLInputElement).value;
//       const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
//       const lastName = (document.getElementById('lastName') as HTMLInputElement).value;

//       const response = await fetch('/api/persons', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ rank, firstName, lastName })
//       });

//       const person = await response.json();
//       const li = document.createElement('li');
//       li.textContent = `${person.rank} ${person.firstName} ${person.lastName}`;
//       personsList.appendChild(li);

//       personForm.reset();
//   });

//   recordForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const data = (document.getElementById('data') as HTMLTextAreaElement).value;
//       const personIds = (document.getElementById('personIds') as HTMLInputElement).value.split(',').map(id => id.trim());

//       const response = await fetch('/api/records', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ data, personIds })
//       });

//       const record = await response.json();
//       const li = document.createElement('li');
//       li.textContent = `Data: ${record.data}, Persons: ${record.persons.map((p: any) => `${p.rank} ${p.firstName} ${p.lastName}`).join(', ')}`;
//       recordsList.appendChild(li);

//       recordForm.reset();
//   });

//   // Fetch existing persons
//   fetch('/api/persons')
//       .then(response => response.json())
//       .then(persons => {
//           persons.forEach((person: any) => {
//               const li = document.createElement('li');
//               li.textContent = `${person.rank} ${person.firstName} ${person.lastName}`;
//               personsList.appendChild(li);
//           });
//       });

//   // Fetch existing records
//   fetch('/api/records')
//       .then(response => response.json())
//       .then(records => {
//           records.forEach((record: any) => {
//               const li = document.createElement('li');
//               li.textContent = `Data: ${record.data}, Persons: ${record.persons.map((p: any) => `${p.rank} ${p.firstName} ${p.lastName}`).join(', ')}`;
//               recordsList.appendChild(li);
//           });
//       });
// });

main().catch(console.error);
