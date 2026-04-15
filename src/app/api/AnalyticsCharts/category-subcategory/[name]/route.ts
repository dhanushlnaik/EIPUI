import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.OPENPRS_MONGODB_URI || '';
const DB_NAME = process.env.OPENPRS_DATABASE || 'prsdb';

const CHART_COLLECTIONS: Record<string, string> = {
  eips: 'eipsCategorySubcategoryCharts',
  ercs: 'ercsCategorySubcategoryCharts',
  rips: 'ripsCategorySubcategoryCharts',
  all: 'allCategorySubcategoryCharts',
};

export interface CategorySubcategoryDoc {
  _id: string;
  category: string;
  monthYear: string;
  type: string; // "Category|Subcategory" e.g. "NEW EIP|Waiting on Editor"
  count: number;
}

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
  const months = req.nextUrl.searchParams.get("months");

  if (!name || typeof name !== 'string' || !CHART_COLLECTIONS[name]) {
    return NextResponse.json({
      error: 'Invalid collection name. Must be: eips, ercs, rips, or all',
    }, { status: 400 });
  }

  let monthsNumber = 0;
  if (months && typeof months === 'string') {
    monthsNumber = parseInt(months, 10);
    if (isNaN(monthsNumber) || monthsNumber < 1) {
      return NextResponse.json({ error: 'Invalid months. Must be a positive number' }, { status: 400 });
    }
  }

  try {
    const db = await connectToDatabase();
    const collectionName = CHART_COLLECTIONS[name];

    let rawData: { _id?: unknown; category?: string; monthYear?: string; type?: string; count?: number }[];

    if (name === 'all') {
      const collection = db.collection(collectionName);
      rawData = await collection.find({}).sort({ monthYear: -1, type: 1 }).toArray();
      if (!rawData || rawData.length === 0) {
        const [eipsData, ercsData, ripsData] = await Promise.all([
          db.collection(CHART_COLLECTIONS.eips).find({}).toArray(),
          db.collection(CHART_COLLECTIONS.ercs).find({}).toArray(),
          db.collection(CHART_COLLECTIONS.rips).find({}).toArray(),
        ]);
        const agg = new Map<string, { monthYear: string; type: string; count: number }>();
        [...(eipsData as any[]), ...(ercsData as any[]), ...(ripsData as any[])].forEach((d: any) => {
          const monthYear = d.monthYear || '';
          const type = d.type || '';
          if (!monthYear || !type) return;
          const key = `${monthYear}__${type}`;
          const prev = agg.get(key) || { monthYear, type, count: 0 };
          prev.count += d.count || 0;
          agg.set(key, prev);
        });
        rawData = Array.from(agg.values());
      }
    } else {
      const collection = db.collection(collectionName);
      rawData = await collection.find({}).sort({ monthYear: -1, type: 1 }).toArray();
    }

    let chartData: CategorySubcategoryDoc[] = (rawData as any[]).map((doc: any) => ({
      _id: String(doc._id ?? `${doc.monthYear}-${doc.type}`),
      category: doc.category ?? name,
      monthYear: doc.monthYear ?? '',
      type: doc.type ?? '',
      count: typeof doc.count === 'number' ? doc.count : 0,
    }));

    if (monthsNumber > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - monthsNumber);
      const cutoffMonthYear = cutoff.toISOString().slice(0, 7);
      chartData = chartData.filter((item) => item.monthYear >= cutoffMonthYear);
    }

    chartData.sort((a, b) => {
      if (a.monthYear !== b.monthYear) return a.monthYear.localeCompare(b.monthYear);
      return (a.type || '').localeCompare(b.type || '');
    });

    return NextResponse.json({
      data: chartData,
      metadata: {
        totalRecords: chartData.length,
        monthsWindow: monthsNumber || 'all',
        collection: collectionName,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Category-subcategory chart API error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve category-subcategory chart data',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
