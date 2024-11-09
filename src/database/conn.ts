import mongoose from "mongoose";

// main().catch(err => console.log(err))

mongoose.Promise = Promise

mongoose.connection.on('error', (stream) => {
    console.log('db conect error ', stream);
  });

mongoose.set('debug', true)

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/autospot-api-v1')
    console.log('db conect  connected------!');
}

export const dbConn = main