import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { ActivityTimelineResponse } from "@/types/contributors";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");
    const repository = searchParams.get("repository") || undefined;
    const activityType = searchParams.get("activityType") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const client = await clientPromise;
    const db = client.db("test");

    const filter: any = { username };

    if (repository) filter.repository = repository;

    if (activityType) filter.activityType = activityType;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    const total = await db.collection("activities").countDocuments(filter);

    const activities = await db
      .collection("activities")
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limitNum)
      .toArray();

    return NextResponse.json({
      activities: activities.map((a: any) => ({
        ...a,
        _id: a._id.toString(),
      })) as any,
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: offset + limitNum < total,
    });
  } catch (error: any) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" } satisfies { error: string },
      { status: 500 },
    );
  }
}
