import { NextResponse } from "next/server";
import mongoose, { Schema, model, models } from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.MONGODB_URI;

const viewCountSchema = new Schema({
  path: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
});

const ViewCount = models.ViewCount || model("ViewCount", viewCountSchema);

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const result = await ViewCount.findOneAndUpdate(
      { path },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ viewCount: result.count }, { status: 200 });
  } catch (error) {
    console.error("Error updating view count:", error);
    return NextResponse.json({ error: "Error updating view count" }, { status: 500 });
  }
}
