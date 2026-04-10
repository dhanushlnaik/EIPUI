import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.OPENPRS_MONGODB_URI;
const DBNAME = process.env.OPENPRS_DATABASE;

const repoStatsSchema = new mongoose.Schema(
  {
    repository: String,
    total_contributors: Number,
    total_commits: Number,
    total_additions: Number,
    total_deletions: Number,
    top_contributors: [
      {
        login: String,
        commits: Number,
        additions: Number,
        deletions: Number,
        rank: Number,
      },
    ],
    weekly_activity: [
      {
        week: Date,
        total_commits: Number,
        total_additions: Number,
        total_deletions: Number,
        active_contributors: Number,
      },
    ],
    summary_text: String,
    last_updated: Date,
  },
  { strict: false }
);

const REPO_STATS =
  mongoose.models.REPO_STATS || mongoose.model("REPO_STATS", repoStatsSchema, "repository_stats");

let isConnected = false;
async function connectToDatabase() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI!, { dbName: DBNAME });
  isConnected = true;
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const repository = new URL(request.url).searchParams.get("repository");
    const filter = repository ? { repository } : {};

    const repoStats = await REPO_STATS.find(filter).sort({ repository: 1 }).lean();
    const transformedStats = repoStats.map((stats: any) => ({
      ...stats,
      weekly_activity:
        stats.weekly_activity?.map((week: any) => ({
          ...week,
          week: new Date(week.week).toISOString(),
        })) || [],
      last_updated: new Date(stats.last_updated).toISOString(),
    }));

    if (repository && transformedStats.length === 1) {
      return NextResponse.json(transformedStats[0], { status: 200 });
    }

    return NextResponse.json(transformedStats, { status: 200 });
  } catch (error) {
    console.error("Repository stats API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch repository statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
