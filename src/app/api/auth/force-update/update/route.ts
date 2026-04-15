import { authOptions } from "@/lib/nextAuthOptions";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const newSession = await getServerSession(authOptions);
    return NextResponse.json(newSession);
  } catch (error) {
    console.error("Force update error:", error);
    return NextResponse.json({ error: "Failed to force update" }, { status: 500 });
  }
}
