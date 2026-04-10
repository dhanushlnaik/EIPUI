import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "test";
const COLLECTIONS = {
  all: "ReviewersData",
  eips: "ReviewersDataEIPS",
  ercs: "ReviewersDataERCS",
  rips: "ReviewersDataRIPS",
};

let client: MongoClient | null = null;

const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
};

type Ctx = { params: { name: string } };

export async function GET(_request: Request, context: Ctx) {
  const name = context?.params?.name;
  if (!name || !Object.keys(COLLECTIONS).includes(name)) {
    return NextResponse.json({ error: "Invalid collection name" }, { status: 400 });
  }

  try {
    const db = await connectToDatabase();
    const collectionName = COLLECTIONS[name as keyof typeof COLLECTIONS];
    const data = await db.collection(collectionName).find({}).toArray();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data from the database" },
      { status: 500 }
    );
  }
}
