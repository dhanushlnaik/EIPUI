import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db("eipsinsight");

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      name: user.name,
      tier: user.tier,
    });
  } catch (err) {
    console.error("❌ Failed to get user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
