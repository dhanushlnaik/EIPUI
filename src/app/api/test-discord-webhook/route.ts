import { NextResponse } from "next/server";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEB;

export async function POST() {
  if (!DISCORD_WEBHOOK_URL) {
    return NextResponse.json({ message: "Discord webhook URL not configured" }, { status: 500 });
  }

  try {
    const embed = {
      title: "🧪 Test Notification",
      description: "Testing the Discord webhook integration for EIPs Insight feedback system",
      color: 0x00ff00,
      fields: [
        {
          name: "📊 Status",
          value: "✅ Webhook Working",
          inline: true,
        },
        {
          name: "🕒 Time",
          value: new Date().toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: "EIPs Insight Feedback System Test",
        icon_url:
          "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/ethereum-icon-purple.png",
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "🔔 **EIPs Insight Feedback System Test**",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }

    return NextResponse.json({
      message: "Test webhook sent successfully!",
      webhookResponse: response.status,
    });
  } catch (error) {
    console.error("Discord webhook test failed:", error);
    return NextResponse.json(
      {
        message: "Webhook test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
