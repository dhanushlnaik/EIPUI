import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uri = process.env.MONGODB_URI as string;
type Ctx = { params: { page: string } };

export async function GET(_request: Request, context: Ctx) {
  const page = context?.params?.page;
  if (!page || typeof page !== "string") {
    return NextResponse.json({ message: "page is required" }, { status: 400 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("test");
    const comments = database.collection("comments");
    const allComments = await comments.find({ page }).toArray();
    return NextResponse.json(allComments);
  } catch {
    return NextResponse.json({ message: "Error fetching comments" }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: Request, context: Ctx) {
  const page = context?.params?.page;
  if (!page || typeof page !== "string") {
    return NextResponse.json({ message: "page is required" }, { status: 400 });
  }

  const url = new URL(request.url);
  const commentId = url.searchParams.get("commentId");
  const body = await request.json().catch(() => ({}));
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("test");
    const comments = database.collection("comments");

    if (!commentId) {
      const { content, author, profileLink, profileImage } = body;
      const newComment = {
        content,
        author,
        profileLink,
        profileImage,
        page,
        createdAt: new Date(),
        subComments: [],
      };

      const result = await comments.insertOne(newComment);
      return NextResponse.json(
        { _id: result.insertedId, content, page, createdAt: new Date(), subComments: [] },
        { status: 201 }
      );
    }

    const { content } = body;
    const result = await comments.updateOne(
      { _id: new ObjectId(commentId), page },
      { $push: { subComments: { content, createdAt: new Date() } } }
    );

    if (result.modifiedCount > 0) {
      return NextResponse.json({ message: "Reply added successfully" });
    }
    return NextResponse.json({ message: "Comment not found or page mismatch" }, { status: 404 });
  } catch {
    return NextResponse.json({ message: "Error posting comment" }, { status: 500 });
  } finally {
    await client.close();
  }
}
