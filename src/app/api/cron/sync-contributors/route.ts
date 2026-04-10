import clientPromise from "@/lib/mongodb";
import { ContributorSyncService } from "@/services/ContributorSyncService";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function runSync(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  const errors: string[] = [];
  const logs: string[] = [];
  const logger = {
    info: (msg: string, data?: any) => {
      const logMsg = `[INFO] ${msg} ${data ? JSON.stringify(data) : ""}`;
      console.log(logMsg);
      logs.push(logMsg);
    },
    error: (msg: string, err?: any) => {
      const errorMsg = `[ERROR] ${msg} ${err ? JSON.stringify(err) : ""}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    },
    warn: (msg: string, data?: any) => {
      const warnMsg = `[WARN] ${msg} ${data ? JSON.stringify(data) : ""}`;
      console.warn(warnMsg);
      logs.push(warnMsg);
    },
  };

  try {
    const tokens = (process.env.GITHUB_TOKENS || "").split(",").filter(Boolean);
    if (tokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No GitHub tokens configured",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    logger.info("Starting automated contributor sync", {
      tokenCount: tokens.length,
      timestamp: new Date().toISOString(),
    });

    const syncService = new ContributorSyncService(tokens, logger);
    await syncService.syncAllRepositories();
    await syncService.updateActivityTimestamps();

    const client = await clientPromise;
    const db = client.db("test");
    const totalContributors = await db.collection("contributors").countDocuments({ isBot: false });
    const totalActivities = await db.collection("activities").countDocuments({});

    logger.info("Sync completed successfully", { totalContributors, totalActivities });

    return NextResponse.json({
      success: true,
      message: `Sync completed. ${totalContributors} contributors, ${totalActivities} activities`,
      timestamp: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    logger.error("Sync failed", error);
    return NextResponse.json(
      {
        success: false,
        message: "Sync failed",
        timestamp: new Date().toISOString(),
        errors: [error.message, ...errors],
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return runSync(request);
}

export async function POST(request: Request) {
  return runSync(request);
}
