import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PR {
  prNumber: number;
  prTitle: string;
  createdAt: Date;
  closedAt?: Date | null;
  mergedAt?: Date | null;
  recentDate: Date;
}

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(uri);
}

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

const PrDetails =
  mongoose.models.AllErcsPrDetails || mongoose.model("AllErcsPrDetails", prDetailsSchema);

export async function GET() {
  try {
    await ensureConnection();
    const prDetails = await PrDetails.find({
      $or: [{ closedAt: { $ne: null } }, { mergedAt: { $ne: null } }],
    })
      .select("prNumber prTitle createdAt closedAt mergedAt")
      .lean();

    const sortedPRs: PR[] = (prDetails as any[])
      .map((pr) => {
        const recentDate =
          pr.mergedAt && pr.closedAt
            ? new Date(pr.mergedAt) > new Date(pr.closedAt)
              ? pr.mergedAt
              : pr.closedAt
            : pr.mergedAt || pr.closedAt;

        return {
          ...pr,
          recentDate,
        } as PR;
      })
      .sort((a, b) => new Date(b.recentDate).getTime() - new Date(a.recentDate).getTime())
      .slice(0, 30);

    const transformed = sortedPRs.map((pr) => ({
      repo: "ERCs",
      prNumber: pr.prNumber,
      prTitle: pr.prTitle,
      created_at: pr.createdAt,
      closed_at: pr.closedAt || null,
      merged_at: pr.mergedAt || null,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
