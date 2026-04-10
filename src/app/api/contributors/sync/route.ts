import { ContributorSyncService } from "@/services/ContributorSyncService";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.CONTRIBUTORS_SYNC_API_KEY;
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { repository } = body;
    const tokens = (process.env.GITHUB_TOKENS || "").split(",").filter(Boolean);

    if (tokens.length === 0) {
      return NextResponse.json(
        { success: false, message: "No GitHub tokens configured" },
        { status: 500 }
      );
    }

    const logger = {
      info: (msg: string, data?: any) => console.log(`[SYNC INFO] ${msg}`, data || ""),
      error: (msg: string, err?: any) => console.error(`[SYNC ERROR] ${msg}`, err || ""),
      warn: (msg: string, data?: any) => console.warn(`[SYNC WARN] ${msg}`, data || ""),
    };

    const syncService = new ContributorSyncService(tokens, logger);
    if (repository) {
      const activitiesProcessed = await syncService.syncRepository(repository);
      return NextResponse.json({
        success: true,
        message: `Sync completed for ${repository}`,
        activitiesProcessed,
      });
    }

    await syncService.syncAllRepositories();
    await syncService.updateActivityTimestamps();
    return NextResponse.json({
      success: true,
      message: "Sync completed for all repositories",
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Sync failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
