import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { username: string } };

export async function GET(request: Request, context: Ctx) {
  try {
    const { username } = context.params;
    const url = new URL(request.url);
    const repository = url.searchParams.get("repository") || undefined;
    const activityType = url.searchParams.get("activityType") || undefined;
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "20";

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Username is required", code: "INVALID_PARAMS" },
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("eipsinsight");
    const collection = db.collection("activities");

    const query: any = {
      username: { $regex: new RegExp(`^${username}$`, "i") },
    };

    if (repository) query.repository = repository;
    if (activityType) query.activityType = activityType;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const sortDirection: 1 | -1 = sortOrder === "asc" ? 1 : -1;
    const sort = { timestamp: sortDirection };

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limitNum).toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Contributor timeline API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch timeline",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
