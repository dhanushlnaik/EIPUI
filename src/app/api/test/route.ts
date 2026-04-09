import mongoose, { Schema } from "mongoose";
import { NextResponse } from "next/server";

const prDetailsSchema = new Schema({
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
  mergedAt: { type: Date },
  closedAt: { type: Date },
});

const EipPrDetails = mongoose.models.alleipsprdetails || mongoose.model("alleipsprdetails", prDetailsSchema);
const ErcPrDetails = mongoose.models.allercsprdetails || mongoose.model("allercsprdetails", prDetailsSchema);
const RipPrDetails = mongoose.models.allripsprdetails || mongoose.model("allripsprdetails", prDetailsSchema);

async function ensureMongoConnection() {
  if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

export async function GET() {
  try {
    await ensureMongoConnection();
    const startDate = new Date("2022-09-07T00:00:00Z");

    const [eipPrNumbers, ercPrNumbers, ripPrNumbers] = await Promise.all([
      EipPrDetails.find(
        { $or: [{ closedAt: { $gte: startDate } }, { mergedAt: { $gte: startDate } }] },
        { prTitle: 1, prNumber: 1, closedAt: 1, mergedAt: 1, _id: 0 },
      ).lean(),
      ErcPrDetails.find(
        { $or: [{ closedAt: { $gte: startDate } }, { mergedAt: { $gte: startDate } }] },
        { prTitle: 1, prNumber: 1, closedAt: 1, mergedAt: 1, _id: 0 },
      ).lean(),
      RipPrDetails.find(
        { $or: [{ closedAt: { $gte: startDate } }, { mergedAt: { $gte: startDate } }] },
        { prTitle: 1, prNumber: 1, closedAt: 1, mergedAt: 1, _id: 0 },
      ).lean(),
    ]);

    const formattedPrNumbers = [
      ...eipPrNumbers.map((pr: any) => ({
        prNumber: pr.prNumber,
        prTitle: pr.prTitle,
        closedAt: pr.closedAt,
        mergedAt: pr.mergedAt,
        repo: "EIPs",
      })),
      ...ercPrNumbers.map((pr: any) => ({
        prNumber: pr.prNumber,
        prTitle: pr.prTitle,
        closedAt: pr.closedAt,
        mergedAt: pr.mergedAt,
        repo: "ERCs",
      })),
      ...ripPrNumbers.map((pr: any) => ({
        prNumber: pr.prNumber,
        prTitle: pr.prTitle,
        closedAt: pr.closedAt,
        mergedAt: pr.mergedAt,
        repo: "RIPs",
      })),
    ];

    return NextResponse.json(formattedPrNumbers);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
