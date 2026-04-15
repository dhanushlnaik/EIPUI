import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const MONGODB_URI =
  process.env.CONTRI_URI ||
  process.env.OPENPRS_MONGODB_URI ||
  "mongodb://localhost:27017/eipsinsight";

let cachedClient: MongoClient | null = null;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = await MongoClient.connect(MONGODB_URI);
  cachedClient = client;
  return client;
}

function calculateRankingScore(contributor: any) {
  return (
    (contributor.totalCommits || 0) * 3 +
    (contributor.totalPRs || 0) * 5 +
    (contributor.totalReviews || 0) * 4 +
    (contributor.totalComments || 0) * 2 +
    (contributor.totalIssues || 0) * 3
  );
}

function transformContributor(contributor: any, rank: number) {
  const commits = contributor.totalCommits || contributor.commit || 0;
  const prs = contributor.totalPRs || contributor.pr || 0;
  const prsMerged = contributor.prsMerged || contributor.totalPRsMerged || 0;
  const reviews = contributor.totalReviews || contributor.review || 0;
  const comments = contributor.totalComments || contributor.comment || 0;
  const issues = contributor.totalIssues || contributor.issue || 0;

  return {
    rank,
    username: contributor.githubUsername || contributor.username || contributor.login,
    name: contributor.name || contributor.githubUsername,
    avatarUrl: contributor.avatarUrl || contributor.avatar_url,
    commits,
    prs,
    prsOpened: prs,
    prsMerged,
    reviews,
    comments,
    issues,
    score: calculateRankingScore({
      totalCommits: commits,
      totalPRs: prs,
      totalReviews: reviews,
      totalComments: comments,
      totalIssues: issues,
    }),
    totals: {
      commits,
      prsOpened: prs,
      prsMerged,
      reviews,
      comments,
      issuesOpened: issues,
      activityScore: calculateRankingScore({
        totalCommits: commits,
        totalPRs: prs,
        totalReviews: reviews,
        totalComments: comments,
        totalIssues: issues,
      }),
    },
    activityStatus: contributor.activityStatus || "Active",
    avgResponseTime: contributor.avgResponseTime,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") || "10";
    const period = url.searchParams.get("period") || "all";
    const limitNum = parseInt(limit, 10) || 10;

    const client = await connectToDatabase();
    const db = client.db();
    const contributors = db.collection("contributors");

    const isTimePeriod = period === "weekly" || period === "monthly";
    let startDate: Date | null = null;
    let extendedPeriod = false;

    if (period === "weekly") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "monthly") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    const hasRecentData = async () => {
      if (!startDate) return true;
      const recentCount = await contributors.countDocuments({
        "timeline.timestamp": { $gte: startDate.toISOString() },
      });
      return recentCount > 0;
    };

    if (isTimePeriod && !(await hasRecentData())) {
      extendedPeriod = true;
      if (period === "weekly") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
      } else if (period === "monthly") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 180);
      }
    }

    const getTimelineRankings = async (type?: string, repo?: string) => {
      const matchStage: any = {};

      if (startDate) {
        matchStage["timeline.timestamp"] = { $gte: startDate.toISOString() };
      }
      if (repo) {
        matchStage["timeline.repo"] = repo;
      }

      const pipeline: any[] = [
        { $match: { timeline: { $exists: true, $ne: [] } } },
        { $unwind: "$timeline" },
      ];

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      const groupStage: any = {
        _id: "$_id",
        githubUsername: { $first: "$githubUsername" },
        username: { $first: "$username" },
        name: { $first: "$name" },
        avatarUrl: { $first: "$avatarUrl" },
        activityStatus: { $first: "$activityStatus" },
        avgResponseTime: { $first: "$avgResponseTime" },
        login: { $first: "$login" },
      };

      if (type) {
        groupStage[type] = {
          $sum: { $cond: [{ $eq: ["$timeline.type", type] }, 1, 0] },
        };
      } else {
        groupStage.totalCommits = {
          $sum: { $cond: [{ $eq: ["$timeline.type", "commit"] }, 1, 0] },
        };
        groupStage.totalPRs = {
          $sum: { $cond: [{ $eq: ["$timeline.type", "pr"] }, 1, 0] },
        };
        groupStage.totalReviews = {
          $sum: { $cond: [{ $eq: ["$timeline.type", "review"] }, 1, 0] },
        };
        groupStage.totalComments = {
          $sum: { $cond: [{ $eq: ["$timeline.type", "comment"] }, 1, 0] },
        };
        groupStage.totalIssues = {
          $sum: { $cond: [{ $eq: ["$timeline.type", "issue"] }, 1, 0] },
        };
      }

      pipeline.push({ $group: groupStage });

      const sortField = type || "totalCommits";
      pipeline.push({ $sort: { [sortField]: -1 } }, { $limit: limitNum });

      const results = await contributors.aggregate(pipeline).toArray();
      return results.map((c: any, index: number) => transformContributor(c, index + 1));
    };

    const [overall, commits, prs, reviews, comments, issues, eips, ercs, rips] =
      isTimePeriod
        ? await Promise.all([
            getTimelineRankings(),
            getTimelineRankings("commit"),
            getTimelineRankings("pr"),
            getTimelineRankings("review"),
            getTimelineRankings("comment"),
            getTimelineRankings("issue"),
            getTimelineRankings(undefined, "EIPs"),
            getTimelineRankings(undefined, "ERCs"),
            getTimelineRankings(undefined, "RIPs"),
          ])
        : await Promise.all([
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    avgResponseTime: { $first: "$avgResponseTime" },
                    totalCommits: { $sum: { $cond: [{ $eq: ["$timeline.type", "commit"] }, 1, 0] } },
                    totalPRs: { $sum: { $cond: [{ $eq: ["$timeline.type", "pr"] }, 1, 0] } },
                    totalReviews: { $sum: { $cond: [{ $eq: ["$timeline.type", "review"] }, 1, 0] } },
                    totalComments: { $sum: { $cond: [{ $eq: ["$timeline.type", "comment"] }, 1, 0] } },
                    totalIssues: { $sum: { $cond: [{ $eq: ["$timeline.type", "issue"] }, 1, 0] } },
                  },
                },
                { $sort: { totalCommits: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                { $match: { "timeline.type": "commit" } },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    totalCommits: { $sum: 1 },
                  },
                },
                { $sort: { totalCommits: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                { $match: { "timeline.type": "pr" } },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    totalPRs: { $sum: 1 },
                  },
                },
                { $sort: { totalPRs: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                { $match: { "timeline.type": "review" } },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    avgResponseTime: { $first: "$avgResponseTime" },
                    totalReviews: { $sum: 1 },
                  },
                },
                { $sort: { totalReviews: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                { $match: { "timeline.type": "comment" } },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    totalComments: { $sum: 1 },
                  },
                },
                { $sort: { totalComments: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                { $match: { "timeline.type": "issue" } },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    totalIssues: { $sum: 1 },
                  },
                },
                { $sort: { totalIssues: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                { $match: { "timeline.repo": "EIPs" } },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    totalCommits: { $sum: { $cond: [{ $eq: ["$timeline.type", "commit"] }, 1, 0] } },
                    totalPRs: { $sum: { $cond: [{ $eq: ["$timeline.type", "pr"] }, 1, 0] } },
                    totalReviews: { $sum: { $cond: [{ $eq: ["$timeline.type", "review"] }, 1, 0] } },
                  },
                },
                { $sort: { totalCommits: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                { $match: { "timeline.repo": "ERCs" } },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    totalCommits: { $sum: { $cond: [{ $eq: ["$timeline.type", "commit"] }, 1, 0] } },
                    totalPRs: { $sum: { $cond: [{ $eq: ["$timeline.type", "pr"] }, 1, 0] } },
                    totalReviews: { $sum: { $cond: [{ $eq: ["$timeline.type", "review"] }, 1, 0] } },
                  },
                },
                { $sort: { totalCommits: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
            contributors
              .aggregate([
                { $match: { timeline: { $exists: true, $ne: [] } } },
                { $unwind: "$timeline" },
                { $match: { "timeline.repo": "RIPs" } },
                {
                  $group: {
                    _id: "$_id",
                    githubUsername: { $first: "$githubUsername" },
                    username: { $first: "$username" },
                    login: { $first: "$login" },
                    name: { $first: "$name" },
                    avatarUrl: { $first: "$avatarUrl" },
                    activityStatus: { $first: "$activityStatus" },
                    totalCommits: { $sum: { $cond: [{ $eq: ["$timeline.type", "commit"] }, 1, 0] } },
                    totalPRs: { $sum: { $cond: [{ $eq: ["$timeline.type", "pr"] }, 1, 0] } },
                    totalReviews: { $sum: { $cond: [{ $eq: ["$timeline.type", "review"] }, 1, 0] } },
                  },
                },
                { $sort: { totalCommits: -1 } },
                { $limit: limitNum },
              ])
              .toArray()
              .then((data) => data.map((c: any, index: number) => transformContributor(c, index + 1))),
          ]);

    return NextResponse.json({
      period,
      extendedPeriod,
      rankings: {
        overall,
        commits,
        prs,
        reviews,
        comments,
        issues,
        repos: {
          eips,
          ercs,
          rips,
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch rankings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
