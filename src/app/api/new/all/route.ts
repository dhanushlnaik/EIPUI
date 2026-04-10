import { NextResponse } from "next/server";
import { getAllProposals } from "@/server/data/allProposals";

export async function GET() {
  try {
    const data = await getAllProposals();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error retrieving standards from Postgres:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
