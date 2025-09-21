import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'flowstream';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  console.log('Attempting to connect to MongoDB...');
  if (cachedClient && cachedDb) {
    try {
      // Ping the database to check if the connection is still alive
      await cachedClient.db('admin').command({ ping: 1 });
      console.log('Reusing existing MongoDB connection.');
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn('MongoDB connection lost. Attempting to reconnect...', error);
      cachedClient = null;
      cachedDb = null;
    }
  }

  const client = new MongoClient(uri!);

  try {
    await client.connect();
    const db = client.db(dbName);
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('Successfully connected to MongoDB.');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    // Ensure the client is closed if connection fails
    await client.close();
    throw new Error('Failed to connect to the database.');
  }
}
