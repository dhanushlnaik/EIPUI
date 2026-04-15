import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Name is required as a query parameter" },
      { status: 400 }
    );
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("test");
    const collection = db.collection("lastUpdated");
    const document = await collection.findOne<{ time?: unknown }>({ name });

    if (!document) {
      return NextResponse.json(
        { error: `Document with name '${name}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ lastUpdatedTime: document.time }, { status: 200 });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data from the database" },
      { status: 500 }
    );
  }
}
