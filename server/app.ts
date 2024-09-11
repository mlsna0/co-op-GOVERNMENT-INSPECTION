import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import setMongo from './mongo';  // Import the setMongo function
import setRoutes from './routes';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const corsOptions = {
  origin: 'http://localhost:4200', // Your frontend origin
  optionsSuccessStatus: 200,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
};

app.use(cors(corsOptions));
// app.use(bodyParser.json());

app.use(express.json());  
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use('/img', express.static(path.join(__dirname, './img')));
app.use('/api/stampSignature', express.static(__dirname));
app.use('/pdfDocuments', express.static(path.join(__dirname, 'dist/server')));
app.use('/', express.static(path.join(__dirname, '../public')));
dotenv.config();
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


async function main(): Promise<void> {
 

  try {
    await setMongo(); 
    setRoutes(app);   
  } catch (err) {
    // console.error(err);
  }
  app.set('port', (3000));
  const PORT = 3000;
  app.listen(PORT, () => {
    // console.log(`Server is running on port ${PORT}`);
  });
}



main().catch(console.error);
