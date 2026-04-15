import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEB;

interface FeedbackData {
  rating: "positive" | "neutral" | "negative";
  comment?: string;
  page: string;
  timestamp: string;
}

async function sendDiscordNotification(feedbackData: any) {
  try {
    if (!DISCORD_WEBHOOK_URL) {
      console.log("Discord webhook URL not configured, skipping notification");
      return;
    }

    const ratingMap: Record<string, { emoji: string; color: number; text: string }> = {
      positive: { emoji: "👍", color: 0x00ff00, text: "Positive" },
      neutral: { emoji: "😐", color: 0xffaa00, text: "Neutral" },
      negative: { emoji: "👎", color: 0xff0000, text: "Negative" },
    };

    const rating = ratingMap[feedbackData.rating] || ratingMap.neutral;

    const embed: any = {
      title: `${rating.emoji} New Enhanced Feedback Received`,
      description: feedbackData.comment
        ? `**Rating:** ${rating.text}\n**Comment:** "${feedbackData.comment}"`
        : `**Rating:** ${rating.text}`,
      color: rating.color,
      fields: [
        { name: "📊 Rating", value: `${rating.emoji} ${rating.text}`, inline: true },
        { name: "🌐 Page", value: feedbackData.page || "Unknown", inline: true },
        { name: "🕒 Time", value: new Date().toLocaleString(), inline: true },
      ],
      footer: {
        text: "EIPs Insight Enhanced Feedback System",
        icon_url:
          "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/ethereum-icon-purple.png",
      },
      timestamp: new Date().toISOString(),
    };

    if (feedbackData.comment) {
      embed.fields.push({
        name: "💬 Comment",
        value:
          feedbackData.comment.length > 100
            ? feedbackData.comment.substring(0, 100) + "..."
            : feedbackData.comment,
        inline: false,
      });
    }

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
  let body: FeedbackData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { rating, comment, page, timestamp } = body;

  if (!rating || !["positive", "neutral", "negative"].includes(rating)) {
    return NextResponse.json({ message: "Invalid rating" }, { status: 400 });
  }

  if (!page || !timestamp) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
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
    const ip = request.headers.get("x-forwarded-for") || "Unknown";

    const feedbackRecord = {
      rating,
      comment: comment || null,
      page,
      timestamp: new Date(timestamp),
      createdAt: new Date(),
      userAgent,
      ip,
    };

    await db.collection("enhanced_feedbacks").insertOne(feedbackRecord);
    await sendDiscordNotification(feedbackRecord);

    return NextResponse.json({ message: "Feedback recorded successfully" }, { status: 201 });
  } catch (e) {
    console.error("MongoDB error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
