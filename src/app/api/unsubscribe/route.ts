import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";
import { parseUnsubscribeToken } from "@/utils/subscriptionLinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedFilters = ["all", "status", "content"];
const allowedTypes = ["eips", "ercs", "rips"];

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const identity = token ? parseUnsubscribeToken(token) : null;
  if (!identity) {
    return new Response("Invalid unsubscribe link", { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("eipsinsight");
    await db.collection("subscriptions").deleteOne(identity);
    return new Response("You have been unsubscribed successfully.", { status: 200 });
  } catch (error) {
    console.error("Token unsubscribe error:", error);
    return new Response("Failed to unsubscribe.", { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const id = body?.id;
  const filter = body?.filter;

  if (!type || !id || !filter) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!allowedTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type value" }, { status: 400 });
  }
  if (!allowedFilters.includes(filter)) {
    return NextResponse.json({ error: "Invalid filter value" }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("eipsinsight");
    await db.collection("subscriptions").deleteOne({ email, type, id, filter });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unsubscribe API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
