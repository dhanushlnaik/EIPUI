import { NextResponse } from 'next/server';
const mongoose = require('mongoose');

if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to the database');
    })
    .catch((error: any) => {
      console.error('Error connecting to the database:', error.message);
    });
}

const likeSchema = new mongoose.Schema({
  pageName: String,
  likeCount: Number,
  dislikeCount: Number,
});

const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);

export async function POST() {
  try {
    const pageName = 'dislike';
    let likeDoc = await Like.findOne({ pageName });

    if (!likeDoc) {
      likeDoc = new Like({ pageName, likeCount: 0, dislikeCount: 0 });
    }

    likeDoc.dislikeCount++;
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
