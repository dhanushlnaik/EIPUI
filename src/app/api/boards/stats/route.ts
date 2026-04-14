import { NextRequest, NextResponse } from "next/server";
import { orpc } from "@/server/orpc";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get("repo");
    const govState = searchParams.get("govState");
    const search = searchParams.get("search");

    const govStates = govState ? [govState] : undefined;

    const result = await orpc.boards.getOpenPRBoardStats({
      repo: repo as "eips" | "ercs" | "rips" | undefined,
      govState: govStates,
      search: search || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching board stats:", error);
    return NextResponse.json({ error: "Failed to fetch board stats" }, { status: 500 });
  }
}
