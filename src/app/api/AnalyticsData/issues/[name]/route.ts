import { NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'test';
const COLLECTIONS = {
    eips: "eipsIssueAnalytics2",
    ercs: "ercsIssueAnalytics2",
    rips: "ripsIssueAnalytics2",
    all: "allIssueAnalytics2",
  };

let client: MongoClient | null = null;

const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
};

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const { name } = params;

  // Validate collection name and monthYear
  if (!name || typeof name !== 'string' || !Object.keys(COLLECTIONS).includes(name)) {
    return NextResponse.json({ error: 'Invalid collection name' }, { status: 400 });
  }



  try {
    const db = await connectToDatabase();
    const collectionName = COLLECTIONS[name as keyof typeof COLLECTIONS];
    const collection = db.collection(collectionName);

    // Query using the monthYear (number) as a string
    const data = await collection.find({}).toArray();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Failed to retrieve data from the database' }, { status: 500 });
  }
}

// Optional cleanup for when the server is manually closed
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed on app termination');
  }
});
