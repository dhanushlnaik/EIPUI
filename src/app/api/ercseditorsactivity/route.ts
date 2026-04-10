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

const ercReviewSchema = new mongoose.Schema({
  reviewerName: { type: String, required: true },
  prInfo: {
    prNumber: Number,
    prTitle: String,
    prDescription: String,
    labels: [String],
    numCommits: Number,
    filesChanged: [String],
    numFilesChanged: Number,
    mergeDate: Date,
    createdAt: { type: Date, default: Date.now },
    closedAt: Date,
    mergedAt: Date,
  },
  reviews: [
    {
      review: { type: String, required: true },
      reviewDate: { type: Date, required: true },
      reviewComment: String,
    },
  ],
});

const ERCReviewDetails =
  mongoose.models.ERCReviewDetails || mongoose.model("ERCReviewDetails", ercReviewSchema);

export async function GET() {
  try {
    await ensureConnection();
    const reviewersList = [
      "lightclient",
      "SamWilsn",
      "xinbenlv",
      "g11tech",
      "bomanaps",
      "axic",
      "gcolvin",
      "yoavw",
    ];

    const twentyFourHoursAgo = new Date(Date.now() - 1003 * 60 * 60 * 1000);
    const resultByReviewer: Record<string, any[]> = {};
    reviewersList.forEach((handle) => {
      resultByReviewer[handle] = [];
    });

    const reviews = await ERCReviewDetails.aggregate([
      { $match: { reviewerName: { $in: reviewersList } } },
      { $unwind: "$reviews" },
      { $match: { "reviews.reviewDate": { $gte: twentyFourHoursAgo } } },
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
      resultByReviewer[reviewerName].push({ repo: "ERCs", ...rest });
    });

    return NextResponse.json(resultByReviewer);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
