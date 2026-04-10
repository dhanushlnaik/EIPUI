import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prDetailsSchema = new mongoose.Schema({
  prNumber: { type: Number, required: true },
  prTitle: { type: String, required: true },
  prDescription: { type: String },
  labels: [String],
  conversations: { type: Array },
  numConversations: { type: Number },
  participants: [String],
  numParticipants: { type: Number },
  commits: { type: Array },
  numCommits: { type: Number },
  filesChanged: [String],
  numFilesChanged: { type: Number },
  mergeDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  mergedAt: { type: Date },
});

const PrDetails = mongoose.models.AllEipsPrDetails || mongoose.model("AllEipsPrDetails", prDetailsSchema);

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(uri);
}

export async function GET() {
  try {
    await ensureConnection();
    const prDetails = await PrDetails.find({})
      .select("prNumber prTitle createdAt closedAt mergedAt")
      .exec();

    const transformedDetails = prDetails.map((pr: any) => ({
      repo: "EIPs",
      prNumber: pr.prNumber,
      prTitle: pr.prTitle,
      created_at: pr.createdAt,
      closed_at: pr.closedAt,
      merged_at: pr.mergedAt,
    }));

    return NextResponse.json(transformedDetails);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
