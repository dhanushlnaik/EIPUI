import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ message: "MongoDB URI not configured" }, { status: 500 });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test");

    const likeCount = await db.collection("feedbacks").countDocuments({ type: "like" });
    const dislikeCount = await db.collection("feedbacks").countDocuments({ type: "dislike" });

    return NextResponse.json({ likes: likeCount, dislikes: dislikeCount });
  } catch (err) {
    console.error("Error fetching feedback stats:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
