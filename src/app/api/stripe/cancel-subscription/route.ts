import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuthOptions';
import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();
    
    // 1. Find user's Stripe customer ID
    const user = await db.collection('users').findOne({
      email: session.user.email
    });

    console.log("user data:", user);

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // 2. Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data?.length === 0) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const subscription = subscriptions.data[0];

    // 3. Cancel immediately (or set cancel_at_period_end: true for end-of-period)
    const cancelledSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        cancel_at_period_end: true, // Recommended - lets user keep access until period ends
        // metadata: { cancelled_by: user.email }
      }
    );

    // 4. Update user tier in database
    await db.collection('users').updateOne(
      { email: session.user.email },
      { 
        $set: { 
          tier: 'Free',
          subscriptionStatus: 'cancelled',
          subscriptionEndDate: new Date(cancelledSubscription.current_period_end * 1000)
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Subscription will cancel at period end',
      endDate: cancelledSubscription.current_period_end
    });

  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
