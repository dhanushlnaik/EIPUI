import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { username: string } };

export async function GET(_request: Request, context: Ctx) {
  try {
    const { username } = context.params;
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Username is required", code: "INVALID_PARAMS" },
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("eipsinsight");
    const collection = db.collection("contributors");

    const contributor = await collection.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (!contributor) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Contributor not found", code: "NOT_FOUND" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: contributor });
  } catch (error: any) {
    console.error("Contributor details API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "Failed to fetch contributor",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
