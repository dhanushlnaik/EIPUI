import { NextResponse } from 'next/server';
const mongoose = require('mongoose');

if (mongoose.connection.readyState === 0) {
  if (typeof process.env.MONGODB_URI === 'string') {
    mongoose.connect(process.env.MONGODB_URI);
  } else {
    console.error('MONGODB_URI environment variable is not defined');
  }
}

const likeSchema = new mongoose.Schema({
  pageName: String,
  likeCount: Number,
  dislikeCount: Number,
});

const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);

export async function POST() {
  try {
    const pageName = 'like';
    let likeDoc = await Like.findOne({ pageName });

    if (!likeDoc) {
      likeDoc = new Like({ pageName, likeCount: 0, dislikeCount: 0 });
    }

    likeDoc.likeCount++;
    await likeDoc.save();

    return NextResponse.json({
      pageName,
      likeCount: likeDoc.likeCount,
      dislikeCount: likeDoc.dislikeCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
