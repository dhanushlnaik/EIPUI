import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { username: string } };

export async function GET(_request: Request, context: Ctx) {
  try {
    const { username } = context.params;

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

    const contributor = await db.collection("contributors").findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (!contributor) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Contributor not found", code: "NOT_FOUND" },
        },
        { status: 404 }
      );
    }

    const activitiesCollection = db.collection("activities");

    const stats = await activitiesCollection
      .aggregate([
        {
          $match: {
            username: { $regex: new RegExp(`^${username}$`, "i") },
          },
        },
        {
          $group: {
            _id: null,
            totalActivities: { $sum: 1 },
            byRepository: {
              $push: {
                repository: "$repository",
                activityType: "$activityType",
              },
            },
            byActivityType: {
              $push: "$activityType",
            },
            firstActivity: { $min: "$timestamp" },
            lastActivity: { $max: "$timestamp" },
          },
        },
      ])
      .toArray();

    const statData = stats[0] || {
      totalActivities: 0,
      byRepository: [],
      byActivityType: [],
      firstActivity: null,
      lastActivity: null,
    };

    const byRepository: any = {};
    if (contributor.repositoryStats) {
      contributor.repositoryStats.forEach((repoStat: any) => {
        byRepository[repoStat.repository] = {
          score: repoStat.score || 0,
          commits: repoStat.commits || 0,
          pullRequests: repoStat.pullRequests || 0,
          reviews: repoStat.reviews || 0,
          comments: repoStat.comments || 0,
        };
      });
    }

    const byActivityType: any = {};
    statData.byActivityType.forEach((type: string) => {
      byActivityType[type] = (byActivityType[type] || 0) + 1;
    });

    const activeDays =
      statData.firstActivity && statData.lastActivity
        ? Math.ceil(
            (new Date(statData.lastActivity).getTime() -
              new Date(statData.firstActivity).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          totalScore: contributor.totalScore || 0,
          totalActivities: contributor.totalActivities || 0,
          commits:
            contributor.repositoryStats?.reduce(
              (sum: number, s: any) => sum + (s.commits || 0),
              0
            ) || 0,
          pullRequests:
            contributor.repositoryStats?.reduce(
              (sum: number, s: any) => sum + (s.pullRequests || 0),
              0
            ) || 0,
          reviews:
            contributor.repositoryStats?.reduce(
              (sum: number, s: any) => sum + (s.reviews || 0),
              0
            ) || 0,
          comments:
            contributor.repositoryStats?.reduce(
              (sum: number, s: any) => sum + (s.comments || 0),
              0
            ) || 0,
        },
        byRepository,
        byActivityType,
        timeline: {
          firstActivity: statData.firstActivity || contributor.firstActivityAt,
          lastActivity: statData.lastActivity || contributor.lastActivityAt,
          activeDays,
        },
      },
    });
  } catch (error: any) {
    console.error("Contributor stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch contributor stats",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
