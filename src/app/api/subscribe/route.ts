import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuthOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { addSubscription } from "@/utils/subscriptions";
import { sendSubscriptionEmail } from "@/utils/mailer";
import { buildUnsubscribeUrl } from "@/utils/subscriptionLinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedFilters = ["all", "status", "content"];
const allowedTypes = ["eips", "ercs", "rips"];

async function checkExistingSubscription(email: string, type: string, id: string, filter: string) {
  const client = await connectToDatabase();
  const db = client.db("eipsinsight");
  return db.collection("subscriptions").findOne({ email, type, id, filter });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const body = await request.json().catch(() => null);
  const type = body?.type;
  const id = body?.id;
  const filter = body?.filter;

  if (!userEmail || !type || !id || !filter) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!allowedTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type value" }, { status: 400 });
  }
  if (!allowedFilters.includes(filter)) {
    return NextResponse.json({ error: "Invalid filter value" }, { status: 400 });
  }

  try {
    const existingSub = await checkExistingSubscription(userEmail, type, id, filter);
    if (existingSub) {
      return NextResponse.json(
        { error: "You are already subscribed to this item" },
        { status: 409 }
      );
    }

    await addSubscription({ email: userEmail, type, id, filter });

    await sendSubscriptionEmail(userEmail, {
      type,
      id,
      unsubscribeUrl: buildUnsubscribeUrl({
        email: userEmail,
        type,
        id: String(id),
        filter,
      }),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Subscribe API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
