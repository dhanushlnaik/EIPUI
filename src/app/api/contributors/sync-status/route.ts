import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    const syncStates = await db.collection("sync_state").find({}).sort({ repository: 1 }).toArray();

    return NextResponse.json({
      repositories: syncStates.map((state: any) => ({
        repository: state.repository,
        lastSyncAt: state.lastSyncAt?.toISOString(),
        status: state.status,
        activitiesProcessed: state.activitiesProcessed,
        error: state.error,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
