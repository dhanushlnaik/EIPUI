import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.OPENPRS_MONGODB_URI || '';
const DB_NAME = process.env.OPENPRS_DATABASE || 'prsdb';

// Updated to use the snapshot collections created by the scheduler
const SNAPSHOT_COLLECTIONS = {
  eips: 'eipsPRSnapshots',
  ercs: 'ercsPRSnapshots',
  rips: 'ripsPRSnapshots',
  all: 'allPRSnapshots',
};

let client: MongoClient | null = null;

const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
};

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const name = params.name;
  const page = req.nextUrl.searchParams.get("page") || "1";
  const limit = req.nextUrl.searchParams.get("limit") || "1000";
  const fields = req.nextUrl.searchParams.get("fields");

  // Validate collection name
  if (!name || typeof name !== 'string' || !Object.keys(SNAPSHOT_COLLECTIONS).includes(name)) {
    return NextResponse.json({ error: 'Invalid collection name. Must be: eips, ercs, rips, or all' }, { status: 400 });
  }

  // Parse pagination parameters
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  
  // Validate pagination parameters
  if (isNaN(pageNumber) || pageNumber < 1) {
    return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
  }
  
  if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 1000) {
    return NextResponse.json({ error: 'Invalid limit. Must be between 1 and 1000' }, { status: 400 });
  }

  try {
    const db = await connectToDatabase();
    const collectionName = SNAPSHOT_COLLECTIONS[name as keyof typeof SNAPSHOT_COLLECTIONS];
    const collection = db.collection(collectionName);

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Build projection for field selection
    let projection = {};
    if (fields && typeof fields === 'string') {
      const fieldList = fields.split(',').map(f => f.trim());
      projection = fieldList.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {} as Record<string, number>);
    }

    // Get total count for pagination metadata
    const total = await collection.countDocuments();

    // Query with pagination and field selection, sorted by monthYear descending
    const data = await collection
      .find({})
      .project(projection)
      .sort({ monthYear: -1 }) // Sort by monthYear descending (newest first)
      .skip(skip)
      .limit(limitNumber)
      .toArray();

    // Return paginated response with metadata
    return NextResponse.json({
      data,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        hasNextPage: skip + limitNumber < total,
        hasPrevPage: pageNumber > 1
      },
      metadata: {
        collection: collectionName,
        dataSource: 'scheduler-generated-snapshots',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve snapshot data from the database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Optional cleanup for when the server is manually closed
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed on app termination');
  }
});
