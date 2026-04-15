import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Schema, model, models } from "mongoose";

// Connect to MongoDB using the connection string from the environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Define a schema for the view counts
const DownloadCountSchema = new Schema({
  count: { type: Number, default: 1 }, // Default to 1 when first created
});

// Use the schema to create a model
const DownloadCount = models.DownloadCount || model("DownloadCount", DownloadCountSchema);

// Connect to MongoDB if not already connected
const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return; // Already connected
  }
  await mongoose.connect(MONGODB_URI!);
};

export async function POST() {
  await connectToDatabase();

  try {
    // Increment the count
    const result = await DownloadCount.findOneAndUpdate(
      {}, // No filter, as we have a single document
      { $inc: { count: 1 } }, // Increment count by 1
      { new: true, upsert: true } // Return updated document and upsert if not found
    );

    return NextResponse.json({ DownloadCount: result.count });
  } catch (error) {
    console.error("Error updating view count:", error);
    return NextResponse.json({ error: "Error updating view count" }, { status: 500 });
  }
}
