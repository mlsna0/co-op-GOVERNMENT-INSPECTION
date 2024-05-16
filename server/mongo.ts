// import * as mongoose from 'mongoose';

// async function setMongo(): Promise<any> {
//   let mongodbURI;
//   if (process.env.NODE_ENV === 'test') {
//     mongodbURI = process.env.MONGODB_TEST_URI;
//   } else {
//     mongodbURI = process.env.MONGODB_URI;
//   }
//   mongoose.Promise = global.Promise;
//   mongoose.set('useCreateIndex', true);
//   mongoose.set('useNewUrlParser', true);
//   mongoose.set('useFindAndModify', false);
//   mongoose.set('useUnifiedTopology', true);
//   // Connect to MongoDB using Mongoose
//   await mongoose.connect(mongodbURI);
//   console.log('Connected to MongoDB');
// }
// export default setMongo;

import mongoose = require('mongoose'); 

async function setMongo(): Promise<any> {
  let mongodbURI;
  if (process.env.NODE_ENV === 'test') {
    mongodbURI = process.env.MONGODB_TEST_URI;
  } else {
    mongodbURI = process.env.MONGODB_URI;
  }

  const options = {
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

  };

  (<any>mongoose).Promise = global.Promise;
  // mongoose.set('useCreateIndex', true);
  // mongoose.set('useNewUrlParser', true);
  // mongoose.set('useFindAndModify', false);
  // mongoose.set('useUnifiedTopology', true);
  // Connect to MongoDB using Mongoose
  await mongoose.connect(mongodbURI, options);
  // await mongoose.connect(mongodbURI);
  console.log('Connected to MongoDB');
}

export default setMongo;
