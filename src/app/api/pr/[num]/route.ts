import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

mongoose.connect(process.env.MONGODB_URI as string).catch((error: any) => {
  console.error("Error connecting to database:", error?.message || error);
});

const prDetailsSchema = new mongoose.Schema({
  prNumber: { type: Number },
  prTitle: { type: String },
  prDescription: { type: String },
  labels: { type: [String] },
  conversations: { type: [Object] },
  numConversations: { type: Number },
  participants: { type: [String] },
  numParticipants: { type: Number },
  commits: { type: [Object] },
  numCommits: { type: Number },
  filesChanged: { type: [String] },
  numFilesChanged: { type: Number },
  mergeDate: { type: Date },
});

const PrDetails = mongoose.models.PrDetails || mongoose.model("PrDetails", prDetailsSchema);

export async function GET(
  _request: Request,
  { params }: { params: { num: string } }
) {
  const prNumber = parseInt(params.num, 10);

  try {
    const prDetails = await PrDetails.findOne({ prNumber });
    if (!prDetails) {
      return NextResponse.json({ error: "PR not found" }, { status: 404 });
    }
    return NextResponse.json(prDetails);
  } catch (error) {
    console.error("PR details error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
