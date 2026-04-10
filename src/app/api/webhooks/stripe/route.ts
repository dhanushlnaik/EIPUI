import { connectToDatabase } from "@/lib/mongodb";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true,
});

export const runtime = "nodejs";

async function sendPremiumConfirmationEmail(email: string) {
  const mailOptions = {
    from: `"EIPsInsight" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: "Welcome to Premium!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a4a4a;">Welcome to Premium!</h2>
        <p>Thank you for upgrading to EIPsInsight Premium tier. You now have access to all our exclusive features.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br/>EIPsInsight Team</p>
      </div>
    `,
    text: "Welcome to Premium!\n\nThank you for upgrading to EIPsInsight Premium tier. You now have access to all our exclusive features.\n\nIf you have any questions, please don't hesitate to contact our support team.\n\nBest regards,\nEIPsInsight Team",
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send confirmation email", error);
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    if (
      event.type === "checkout.session.completed" ||
      event.type === "invoice.payment_succeeded" ||
      event.type === "customer.subscription.updated"
    ) {
      let customerEmail: string | undefined;
      let customerId: string | undefined;
      let subscriptionId: string | undefined;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        customerEmail =
          session.customer_email || session.customer_details?.email || undefined;
        customerId =
          typeof session.customer === "string" ? session.customer : undefined;
        subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : undefined;
      } else {
        const stripeObject = event.data.object as Stripe.Invoice | Stripe.Subscription;
        customerId =
          typeof stripeObject.customer === "string"
            ? stripeObject.customer
            : undefined;
        subscriptionId = stripeObject.id;

        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer && typeof customer !== "string" && !customer.deleted) {
            customerEmail = customer.email || undefined;
          }
        }
      }

      if (!customerEmail) {
        return NextResponse.json(
          { error: "Customer email not found" },
          { status: 400 }
        );
      }

      const normalizedEmail = customerEmail.trim().toLowerCase();

      const result = await usersCollection.updateOne(
        { email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
        {
          $set: {
            tier: "Premium",
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
          },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await sendPremiumConfirmationEmail(normalizedEmail);
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.status === "canceled") {
        await db.collection("users").updateOne(
          { stripeCustomerId: subscription.customer },
          { $set: { tier: "Free", subscriptionStatus: "cancelled" } }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
