import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  const client = new MongoClient(process.env.OPENPRS_MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db('txtracker');

    const allBlocks = await db
      .collection('transaction_types')
      .find()
      .sort({ timestamp: -1 })
      .limit(7200)
      .toArray();

    return NextResponse.json({ allBlocks });
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
  } finally {
    await client.close();
  }
}
