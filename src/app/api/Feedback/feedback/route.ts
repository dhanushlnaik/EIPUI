import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEB;

async function sendDiscordNotification(feedbackData: any) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("Discord webhook URL not configured, skipping notification");
    return;
  }

  try {
    const embed = {
      title: "🔔 New Feedback Received",
      description: `User feedback: **${feedbackData.type === "like" ? "👍 Like" : "👎 Dislike"}**`,
      color: feedbackData.type === "like" ? 0x00ff00 : 0xff0000,
      fields: [
        {
          name: "📊 Type",
          value: feedbackData.type === "like" ? "👍 Positive" : "👎 Negative",
          inline: true,
        },
        {
          name: "🌐 Page",
          value: feedbackData.page || "Unknown",
          inline: true,
        },
        {
          name: "🕒 Time",
          value: new Date().toLocaleString(),
          inline: true,
        },
        {
          name: "🌍 User Agent",
          value: feedbackData.userAgent ? feedbackData.userAgent.substring(0, 100) + "..." : "Unknown",
          inline: false,
        },
      ],
      footer: {
        text: "EIPs Insight Feedback System",
        icon_url:
          "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/ethereum-icon-purple.png",
      },
      timestamp: new Date().toISOString(),
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (error) {
    console.error("Discord webhook failed:", error);
  }
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { type, page, comment } = body;
  if (!["like", "dislike"].includes(type)) {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({ message: "MongoDB URI not configured" }, { status: 500 });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test");

    const userAgent = request.headers.get("user-agent") || "Unknown";
    const referer = request.headers.get("referer") || page || "Unknown";
    const ip = request.headers.get("x-forwarded-for") || "Unknown";

    const feedbackData = {
      type,
      page: referer,
      comment: comment || null,
      userAgent,
      ip,
      createdAt: new Date(),
    };

    await db.collection("feedbacks").insertOne(feedbackData);
    await sendDiscordNotification(feedbackData);

    return NextResponse.json({ message: "Feedback recorded" }, { status: 201 });
  } catch (e) {
    console.error("MongoDB error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
