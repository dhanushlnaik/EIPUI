import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const client = await connectToDatabase();
    const db = client.db();
    
    const user = await db.collection('users').findOne(
      { email: email },
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      password:user.password,
      image: user.image,
      tier: user.tier || 'Free',
      walletAddress: user.walletAddress
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
