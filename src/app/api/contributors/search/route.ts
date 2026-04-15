import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const repository = url.searchParams.get("repository");
    const sortBy = url.searchParams.get("sortBy") || "totalScore";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "20";

    const client = await clientPromise;
    const db = client.db("eipsinsight");
    const collection = db.collection("contributors");

    const query: any = { isBot: false };
    if (q) {
      query.$or = [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ];
    }
    if (repository) query.repositories = repository;

    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sort: any = { [sortBy]: sortDirection };
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const [contributors, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limitNum).toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: contributors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Contributors search API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch contributors",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
