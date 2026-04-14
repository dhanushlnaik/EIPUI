import { NextRequest, NextResponse } from "next/server";
import { orpc } from "@/server/orpc";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repo = searchParams.get("repo");
    const govState = searchParams.get("govState");
    const processType = searchParams.get("processType");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const govStates = govState ? [govState] : undefined;
    const processTypes = processType ? [processType] : undefined;

    const result = await orpc.boards.getOpenPRBoard({
      repo: repo as "eips" | "ercs" | "rips" | undefined,
      govState: govStates,
      processType: processTypes,
      search: search || undefined,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching PR board:", error);
    return NextResponse.json({ error: "Failed to fetch PR board" }, { status: 500 });
  }
}
