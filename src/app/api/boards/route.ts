import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    description: "Board API — Open PRs for EIP/ERC/RIP boards",
    endpoints: [
      "GET /api/boards — this help",
      "GET /api/boards/eips — open EIP PRs",
      "GET /api/boards/ercs — open ERC PRs",
      "GET /api/boards/rips — open RIP PRs",
    ],
    queryParams: {
      subcategory:
        "Filter by subcategory, e.g. Waiting on Editor, Waiting on Author, Stagnant, Awaited, Misc",
      category:
        "Filter by category (Process), e.g. PR DRAFT, Typo, NEW EIP, Status Change, Website, Tooling, EIP-1, Other",
      sort: "waitTime (default: longest waiting first) | created (oldest first)",
    },
    exampleRequests: [
      "GET /api/boards/eips",
      "GET /api/boards/eips?subcategory=Waiting%20on%20Editor",
      "GET /api/boards/eips?subcategory=Waiting%20on%20Author",
      "GET /api/boards/eips?category=Typo",
      "GET /api/boards/eips?subcategory=Waiting%20on%20Editor&sort=waitTime",
    ],
  });
}
