import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const githubHandles = [
  "nalepae",
  "SkandaBhat",
  "advaita-saha",
  "jochem-brouwer",
  "Marchhill",
  "bomanaps",
  "daniellehrner",
  "CarlBeek",
  "nconsigny",
  "yoavw",
  "adietrichs",
  "axic",
  "gcolvin",
  "lightclient",
  "SamWilsn",
  "xinbenlv",
  "g11tech",
  "cdetrio",
  "Pandapip1",
  "Souptacular",
  "wanderer",
  "MicahZoltu",
  "arachnid",
  "nicksavers",
  "vbuterin",
];

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(uri);
}

const ripReviewSchema = new mongoose.Schema({
  reviewerName: { type: String, required: true },
  prInfo: {
    prNumber: { type: Number, required: true },
    prTitle: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    mergedAt: { type: Date },
  },
  reviews: [
    {
      review: { type: String, required: true },
      reviewDate: { type: Date, required: true },
      reviewComment: { type: String },
    },
  ],
});

const RIPReviewDetails =
  mongoose.models.RIPReviewDetails || mongoose.model("RIPReviewDetails", ripReviewSchema);

export async function GET() {
  try {
    await ensureConnection();
    const resultByReviewer: Record<string, any[]> = {};
    githubHandles.forEach((handle) => {
      resultByReviewer[handle] = [];
    });

    const reviews = await RIPReviewDetails.aggregate([
      { $match: { reviewerName: { $in: githubHandles } } },
      { $unwind: "$reviews" },
      {
        $project: {
          prNumber: "$prInfo.prNumber",
          prTitle: "$prInfo.prTitle",
          created_at: "$prInfo.createdAt",
          closed_at: "$prInfo.closedAt",
          merged_at: "$prInfo.mergedAt",
          reviewDate: "$reviews.reviewDate",
          reviewComment: "$reviews.reviewComment",
          reviewerName: "$reviewerName",
        },
      },
    ]);

    reviews.forEach((review: any) => {
      const { reviewerName, ...rest } = review;
      if (!resultByReviewer[reviewerName]) resultByReviewer[reviewerName] = [];
      resultByReviewer[reviewerName].push({ repo: "RIPs", ...rest });
    });

    return NextResponse.json(resultByReviewer);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
