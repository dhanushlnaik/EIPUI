import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(uri);
}

const fetchReviewers = async (): Promise<string[]> => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/ethereum/EIPs/master/config/eip-editors.yml"
    );
    const text = await response.text();
    const matches = text.match(/-\s(\w+)/g);
    const reviewers = matches ? Array.from(new Set(matches.map((m) => m.slice(2)))) : [];
    const additionalReviewers = [
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
    ];
    return Array.from(new Set([...reviewers, ...additionalReviewers]));
  } catch (error) {
    console.error("Error fetching reviewers:", error);
    return [];
  }
};

const reviewSchema = new mongoose.Schema({
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

const EIPReviewDetails =
  mongoose.models.EIPReviewDetails || mongoose.model("EIPReviewDetails", reviewSchema);
const ERCReviewDetails =
  mongoose.models.ERCReviewDetails || mongoose.model("ERCReviewDetails", reviewSchema);
const RIPReviewDetails =
  mongoose.models.RIPReviewDetails || mongoose.model("RIPReviewDetails", reviewSchema);

export async function GET() {
  try {
    await ensureConnection();
    const githubHandles = await fetchReviewers();
    const resultByReviewer: Record<string, any[]> = {};
    githubHandles.forEach((handle) => {
      resultByReviewer[handle] = [];
    });

    const collections = [
      { model: EIPReviewDetails, repo: "EIPs" },
      { model: ERCReviewDetails, repo: "ERCs" },
      { model: RIPReviewDetails, repo: "RIPs" },
    ];

    const [eipReviews, ercReviews, ripReviews] = await Promise.all(
      collections.map(({ model, repo }) =>
        model.aggregate([
          { $match: { reviewerName: { $in: githubHandles } } },
          { $unwind: "$reviews" },
          {
            $project: {
              repo,
              reviewerName: "$reviewerName",
              prNumber: "$prInfo.prNumber",
              prTitle: "$prInfo.prTitle",
              created_at: "$prInfo.createdAt",
              closed_at: "$prInfo.closedAt",
              merged_at: "$prInfo.mergedAt",
              reviewDate: "$reviews.reviewDate",
              reviewComment: "$reviews.reviewComment",
            },
          },
        ])
      )
    );

    [...eipReviews, ...ercReviews, ...ripReviews].forEach((review: any) => {
      const { reviewerName, ...rest } = review;
      if (!resultByReviewer[reviewerName]) resultByReviewer[reviewerName] = [];
      resultByReviewer[reviewerName].push(rest);
    });

    return NextResponse.json(resultByReviewer);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
