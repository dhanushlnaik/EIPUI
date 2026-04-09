import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(req: NextRequest) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ message: "MongoDB URI not configured" }, { status: 500 });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test");

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1;
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10) || 50;
    const skip = (page - 1) * limit;

    const feedbacks = await db
      .collection("feedbacks")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCount = await db.collection("feedbacks").countDocuments({});

    const stats = await db
      .collection("feedbacks")
      .aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const likesCount = stats.find((s) => s._id === "like")?.count || 0;
    const dislikesCount = stats.find((s) => s._id === "dislike")?.count || 0;

    return NextResponse.json({
      feedbacks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
      stats: {
        total: totalCount,
        likes: likesCount,
        dislikes: dislikesCount,
        likePercentage: totalCount > 0 ? Math.round((likesCount / totalCount) * 100) : 0,
      },
    });
  } catch (e) {
    console.error("MongoDB error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
