import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuthOptions';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name, password } = await req.json();

  try {
    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection("users");

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    // Update user in database
    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: updateData }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      name: name || session.user.name || null,
      email: session.user.email
    });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
