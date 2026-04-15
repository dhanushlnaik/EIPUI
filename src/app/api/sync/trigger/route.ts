import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { incremental = true } = body;

    const client = await clientPromise;
    const db = client.db("eipsinsight");
    const collection = db.collection("sync_state");

    await collection.updateMany(
      {},
      {
        $set: {
          status: "running",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Sync triggered successfully",
      data: {
        incremental,
        triggeredAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Trigger sync API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "Failed to trigger sync",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
