import { NextResponse } from "next/server";
import { getStatusTimelineV2 } from "@/server/data/statusTimelineV2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getStatusTimelineV2();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error retrieving status timeline (graphsv2):", error?.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
