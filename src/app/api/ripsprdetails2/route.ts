import mongoose from "mongoose";
import { NextResponse } from "next/server";

if (mongoose.connection.readyState === 0) {
  if (typeof process.env.MONGODB_URI === "string") {
    mongoose.connect(process.env.MONGODB_URI);
  } else {
    console.error("MONGODB_URI environment variable is not defined");
  }
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
  mongoose.models.AllRipsPrDetails ||
  mongoose.model("AllRipsPrDetails", prDetailsSchema);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prDetails = await PrDetails.find({})
      .select("prNumber prTitle labels createdAt closedAt mergedAt")
      .exec();

    const transformedDetails = prDetails?.map((pr: any) => {
      const {
        prNumber,
        prTitle,
        labels,
        createdAt: created_at,
        closedAt: closed_at,
        mergedAt: merged_at,
      } = pr;

      return {
        repo: "RIPs",
        prNumber,
        prTitle,
        labels,
        created_at,
        closed_at,
        merged_at,
      };
    });

    return NextResponse.json(transformedDetails);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
