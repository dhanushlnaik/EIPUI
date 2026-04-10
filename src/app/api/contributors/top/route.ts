import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const repository = url.searchParams.get("repository");
    const metric = url.searchParams.get("metric") || "score";
    const limit = url.searchParams.get("limit") || "10";

    const client = await clientPromise;
    const db = client.db("eipsinsight");
    const collection = db.collection("contributors");

    const query: any = { isBot: false };
    if (repository) query.repositories = repository;

    let sortField = "totalScore";
    if (metric === "commits") sortField = "repositoryStats.commits";
    else if (metric === "pullRequests") sortField = "repositoryStats.pullRequests";
    else if (metric === "reviews") sortField = "repositoryStats.reviews";
    else if (metric === "comments") sortField = "repositoryStats.comments";

    const limitNum = Math.min(parseInt(limit, 10), 100);

    if (repository && metric !== "score") {
      const contributors = await collection
        .aggregate([
          { $match: query },
          { $unwind: "$repositoryStats" },
          { $match: { "repositoryStats.repository": repository } },
          { $sort: { [`repositoryStats.${metric}`]: -1 } },
          { $limit: limitNum },
        ])
        .toArray();
      return NextResponse.json({ success: true, data: contributors });
    }

    const contributors = await collection.find(query).sort({ [sortField]: -1 }).limit(limitNum).toArray();
    return NextResponse.json({ success: true, data: contributors });
  } catch (error: any) {
    console.error("Top contributors API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch top contributors",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
