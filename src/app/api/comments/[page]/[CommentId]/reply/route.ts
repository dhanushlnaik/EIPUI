import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uri = process.env.MONGODB_URI as string;
type Ctx = { params: { page: string; CommentId: string } };

export async function POST(request: Request, context: Ctx) {
  const { CommentId, page } = context.params;
  const { content } = await request.json().catch(() => ({}));

  if (!page || typeof page !== "string") {
    return NextResponse.json({ message: "Page parameter is required" }, { status: 400 });
  }

  if (!ObjectId.isValid(CommentId as string)) {
    return NextResponse.json({ message: "Invalid comment ID" }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("test");
    const comments = database.collection("comments");
    const result = await comments.updateOne(
      { _id: new ObjectId(CommentId as string), page },
      { $push: { subComments: { content, createdAt: new Date() } } }
    );

    if (result.modifiedCount > 0) {
      return NextResponse.json({ message: "Reply added successfully" });
    }
    return NextResponse.json({ message: "Comment not found or category mismatch" }, { status: 404 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error posting reply" }, { status: 500 });
  } finally {
    await client.close();
  }
}
