import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const limit = req.nextUrl.searchParams.get("limit") || "20";
    const repository = req.nextUrl.searchParams.get("repository") || undefined;
    const limitNum = parseInt(limit, 10);

    const client = await clientPromise;
    const db = client.db("test");

    const query: any = {};
    if (repository) query.repository = repository;

    const activities = await db
      .collection("activities")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .toArray();

    // Enrich with contributor avatars
    const usernames = [...new Set(activities.map((a: any) => a.username))];
    const contributors = await db
      .collection("contributors")
      .find({ username: { $in: usernames } })
      .project({ username: 1, avatarUrl: 1 })
      .toArray();

    const avatarMap = new Map(
      contributors.map((c: any) => [c.username, c.avatarUrl])
    );

    const enrichedActivities = activities.map((activity: any) => ({
      _id: activity._id.toString(),
      username: activity.username,
      repository: activity.repository,
      activityType: activity.activityType,
      timestamp: activity.timestamp,
      metadata: activity.metadata,
      avatarUrl: avatarMap.get(activity.username),
    }));

    return NextResponse.json({
      activities: enrichedActivities,
      total: enrichedActivities.length,
    });
  } catch (error) {
    console.error("Recent activities error:", error);
    return NextResponse.json({ error: "Failed to fetch recent activities" }, { status: 500 });
  }
}
