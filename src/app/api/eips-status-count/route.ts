import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(uri);
}

const eipHistorySchema = new mongoose.Schema({
  eip: { type: String },
  title: { type: String },
  author: { type: String },
  status: { type: String },
  type: { type: String },
  category: { type: String },
  created: { type: Date },
  discussion: { type: String },
  deadline: { type: String },
  requires: { type: String },
  commitSha: { type: String },
  commitDate: { type: Date },
  mergedDate: { type: Date },
  prNumber: { type: Number },
  closedDate: { type: Date },
  changes: { type: Number },
  insertions: { type: Number },
  deletions: { type: Number },
  mergedDay: { type: Number },
  mergedMonth: { type: Number },
  mergedYear: { type: Number },
  createdMonth: { type: Number },
  createdYear: { type: Number },
  previousdeadline: { type: String },
  newdeadline: { type: String },
  message: { type: String },
});

const EipHistory = mongoose.models.EipHistory || mongoose.model("EipHistory3", eipHistorySchema);

export async function GET() {
  try {
    await ensureConnection();
    const eipStatusCounts = await EipHistory.aggregate([
      {
        $group: {
          _id: { year: "$mergedYear", status: "$status" },
          count: { $sum: 1 },
          eips: { $addToSet: "$eip" },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          data: { $push: { status: "$_id.status", count: "$count", eips: "$eips" } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, year: "$_id", data: 1 } },
    ]);

    return NextResponse.json(eipStatusCounts);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
