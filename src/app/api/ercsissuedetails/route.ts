import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const issueDetailsSchema = new mongoose.Schema({
  issueNumber: { type: Number, required: true, unique: true },
  issueTitle: { type: String, required: true },
  issueDescription: { type: String },
  labels: { type: [String] },
  conversations: { type: [Object] },
  numConversations: { type: Number, default: 0 },
  participants: { type: [String] },
  numParticipants: { type: Number, default: 0 },
  state: { type: String, required: true },
  createdAt: { type: Date, required: true },
  closedAt: { type: Date },
  updatedAt: { type: Date, required: true },
  author: { type: String, required: true },
});

const IssueDetails =
  mongoose.models.AllErcsIssueDetails || mongoose.model("AllErcsIssueDetails", issueDetailsSchema);

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(uri);
}

export async function GET() {
  try {
    await ensureConnection();
    const issueDetails = await IssueDetails.find({})
      .select("issueNumber issueTitle createdAt closedAt state")
      .exec();

    const transformedDetails = issueDetails.map((issue: any) => ({
      repo: "ERCs",
      IssueNumber: issue.issueNumber,
      IssueTitle: issue.issueTitle,
      created_at: issue.createdAt,
      closed_at: issue.closedAt,
      state: issue.state,
    }));

    return NextResponse.json(transformedDetails);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
