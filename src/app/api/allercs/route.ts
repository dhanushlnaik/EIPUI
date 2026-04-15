import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mdFilesSchema = new mongoose.Schema({
  eip: { type: String, unique: true },
  title: { type: String },
  author: { type: String },
  status: { type: String },
  type: { type: String },
  category: { type: String },
  created: { type: String },
});

const MdFiles =
  mongoose.models.ErcMdFiles || mongoose.model("ErcMdFiles3", mdFilesSchema);

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }
  await mongoose.connect(mongoUri);
}

export async function GET() {
  try {
    await ensureConnection();
    const result = await MdFiles.aggregate([{ $sort: { _id: 1 } }]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error retrieving ERCs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
