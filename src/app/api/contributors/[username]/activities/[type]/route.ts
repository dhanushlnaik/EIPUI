import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const MONGODB_URI =
  process.env.CONTRI_URI ||
  process.env.OPENPRS_MONGODB_URI ||
  "mongodb://localhost:27017/eipsinsight";

let cachedClient: MongoClient | null = null;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { username: string; type: string } };

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = await MongoClient.connect(MONGODB_URI);
  cachedClient = client;
  return client;
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function generateCSV(data: any[], type: string, username: string): string {
  const headers = ["Date", "Repository", "Type", "Number", "URL", "Title/Message"];
  const rows = data.map((item: any) => {
    const date = new Date(item.timestamp).toISOString();
    const repo = item.repo || "";
    const itemType = item.type || "";
    const number = item.number || "";
    const url = item.url || "";
    const title = item.metadata?.title || item.metadata?.message || "";
    return [date, repo, itemType, number, url, title].map(escapeCSV).join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export async function GET(request: Request, context: Ctx) {
  try {
    const { username, type } = context.params;
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "100";
    const repo = url.searchParams.get("repo") || undefined;
    const period = url.searchParams.get("period") || "all";
    const sortBy = url.searchParams.get("sortBy") || "timestamp";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const format = url.searchParams.get("format") || "json";

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "Activity type is required" }, { status: 400 });
    }

    const validTypes = ["commits", "prs", "reviews", "comments", "issues"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 100, 500);
    const skip = (pageNum - 1) * limitNum;

    const client = await connectToDatabase();
    const db = client.db();
    const contributors = db.collection("contributors");

    const contributor = await contributors.findOne({
      $or: [{ githubUsername: username }, { username }, { login: username }],
    });

    if (!contributor) {
      return NextResponse.json({ error: "Contributor not found" }, { status: 404 });
    }

    const typeMap: Record<string, string> = {
      commits: "commit",
      prs: "pr",
      reviews: "review",
      comments: "comment",
      issues: "issue",
    };

    const timelineType = typeMap[type];
    let timeline = contributor.timeline || [];

    timeline = timeline.filter((item: any) => item.type === timelineType);

    if (period === "weekly" || period === "monthly") {
      const now = new Date();
      const daysToSubtract = period === "weekly" ? 7 : 30;
      const startDate = new Date(
        now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000
      );

      timeline = timeline.filter((item: any) => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= startDate;
      });
    }

    if (repo) {
      timeline = timeline.filter((item: any) => item.repo === repo);
    }

    timeline.sort((a: any, b: any) => {
      const aVal =
        sortBy === "timestamp"
          ? new Date(a.timestamp).getTime()
          : (a[sortBy as keyof typeof a] as number);
      const bVal =
        sortBy === "timestamp"
          ? new Date(b.timestamp).getTime()
          : (b[sortBy as keyof typeof b] as number);
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });

    const total = timeline.length;
    const paginatedTimeline = timeline.slice(skip, skip + limitNum);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total: timeline.length,
      thisWeek: timeline.filter((item: any) => new Date(item.timestamp) >= weekAgo)
        .length,
      thisMonth: timeline.filter((item: any) => new Date(item.timestamp) >= monthAgo)
        .length,
      avgPerMonth:
        timeline.length > 0
          ? Math.round(
              timeline.length /
                Math.max(
                  1,
                  Math.ceil(
                    (now.getTime() -
                      new Date(
                        timeline[timeline.length - 1]?.timestamp || now
                      ).getTime()) /
                      (30 * 24 * 60 * 60 * 1000)
                  )
                )
            )
          : 0,
    };

    if (format === "csv") {
      const csv = generateCSV(paginatedTimeline, type, username);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${username}-${type}-${new Date()
            .toISOString()
            .split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      username: contributor.githubUsername || contributor.username,
      activityType: type,
      repo: repo || null,
      period,
      data: paginatedTimeline,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: skip + limitNum < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activities",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
