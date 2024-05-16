import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

async function setMongo(): Promise<void> {
  const mongodbURI = process.env.NODE_ENV === 'test' ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI;
  console.log("mongodbURI : ",mongodbURI)

  if (!mongodbURI) {
    throw new Error('MongoDB URI is not defined');
  }

  const options = {
<<<<<<< HEAD
    // useMongoClient: true,
    autoIndex: false, // Don't build indexes
    // reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    // reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    // useNewUrlParser: true,
    // useFindAndModify: false,
    useCreateIndex: true,
    // useUnifiedTopology: true

=======
    autoIndex: false,
    // poolSize: 10,
    // bufferMaxEntries: 0,
    // useNewUrlParser: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
    // useUnifiedTopology: true
    // Remove poolSize and bufferMaxEntries options
>>>>>>> main
  };

  (mongoose as any).Promise = global.Promise;

  try {
    await mongoose.connect(mongodbURI, options);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  }
}

export default setMongo;

  