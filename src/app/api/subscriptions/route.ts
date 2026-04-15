import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("eipsinsight");
    const subs = await db.collection("subscriptions").find({ email }).toArray();
    return NextResponse.json(subs, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
