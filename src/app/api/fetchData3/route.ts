import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import Web3 from 'web3';

export async function GET() {
  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db('test');

    const priorityFeeData = await db
      .collection('priority_fee')
      .find()
      .sort({ timestamp: -1 })
      .limit(7200)
      .toArray();

    const priorityFee = priorityFeeData.map((data) => ({
      time: new Date(data.timestamp).toLocaleTimeString(),
      block: Number(data.blockNumber),
      priorityFee: Number(Web3.utils.fromWei(data.priorityFeePerGas || '0', 'gwei')),
    }));

    return NextResponse.json({ priorityFee });
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
  } finally {
    await client.close();
  }
}
