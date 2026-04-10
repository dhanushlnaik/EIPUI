import { NextResponse } from "next/server";
import { MongoClient, type Db } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uri = process.env.OPENPRS_MONGODB_URI as string;
const dbName = process.env.OPENPRS_DATABASE || "EIPs";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  if (!uri) throw new Error("MONGODB_URI not set in environment.");
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const prs = await db.collection("erc_prs").find({}).toArray();
    return NextResponse.json(prs, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Unable to fetch open PRs" }, { status: 500 });
  }
}
