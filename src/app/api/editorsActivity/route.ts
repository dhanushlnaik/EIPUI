import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.CONTRI_URI;
  if (!uri) throw new Error("CONTRI_URI environment variable is not defined");
  await mongoose.connect(uri);
}

const reviewerSchema = new mongoose.Schema({
  reviewer: String,
  startDate: Date,
  endDate: Date,
});

const Reviewer = mongoose.models.Reviewer || mongoose.model("Reviewer", reviewerSchema);

export async function GET() {
  try {
    await ensureConnection();
    const reviewers = await Reviewer.find();
    const formattedData = reviewers.map((reviewer: any) => ({
      reviewer: reviewer.reviewer,
      startDate: reviewer.startDate?.toISOString(),
      endDate: reviewer.endDate ? reviewer.endDate.toISOString() : null,
    }));
    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
