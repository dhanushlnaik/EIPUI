import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("eipsinsight");
    const collection = db.collection("sync_state");
    const syncStates = await collection.find({}).toArray();

    return NextResponse.json({ success: true, data: syncStates });
  } catch (error: any) {
    console.error("Sync status API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch sync status",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
