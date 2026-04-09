import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.OPENPRS_MONGODB_URI || '';
const DB_NAME = process.env.OPENPRS_DATABASE || 'prsdb';

/** Graph 3: Open PRs by Process × Participants (stacked). type = "Category|Subcategory". Sum per month = Graph 1 Open. */
const CHART_COLLECTIONS: Record<string, string> = {
  eips: 'eipsCategorySubcategoryCharts',
  ercs: 'ercsCategorySubcategoryCharts',
  rips: 'ripsCategorySubcategoryCharts',
  all: 'allCategorySubcategoryCharts',
};

const SPEC_BY_NAME: Record<string, string> = {
  eips: 'EIP',
  ercs: 'ERC',
  rips: 'RIP',
  all: 'ALL',
};

export interface CategorySubcategoryDoc {
  _id: string;
  category: string;
  monthYear: string;
  type: string; // "Process|Participants" e.g. "PR DRAFT|Awaited", "NEW EIP|Waiting on Editor"
  count: number;
}

let client: MongoClient | null = null;

async function getDb() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const name = (params.name || "").toLowerCase();
  const startDate = req.nextUrl.searchParams.get("startDate") || undefined;
  const endDate = req.nextUrl.searchParams.get("endDate") || undefined;
  const months = parseInt(req.nextUrl.searchParams.get("months") || "0", 10) || 0;

  if (!name || !CHART_COLLECTIONS[name]) {
    return NextResponse.json({
      error: 'Invalid name. Use eips, ercs, rips, or all',
    }, { status: 400 });
  }

  try {
    const db = await getDb();
    const collectionName = CHART_COLLECTIONS[name];

    const query: { monthYear?: { $gte?: string; $lte?: string } } = {};
    if (startDate || endDate) {
      query.monthYear = {};
      if (startDate) query.monthYear.$gte = startDate;
      if (endDate) query.monthYear.$lte = endDate;
    }

    let rawData: { _id?: unknown; category?: string; monthYear?: string; type?: string; count?: number }[];

    if (name === 'all') {
      const collection = db.collection(collectionName);
      rawData = await collection.find(Object.keys(query).length ? query : {}).sort({ monthYear: -1, type: 1 }).toArray();
      if (!rawData || rawData.length === 0) {
        const [eipsData, ercsData, ripsData] = await Promise.all([
          db.collection(CHART_COLLECTIONS.eips).find(query).toArray(),
          db.collection(CHART_COLLECTIONS.ercs).find(query).toArray(),
          db.collection(CHART_COLLECTIONS.rips).find(query).toArray(),
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
      rawData = await collection.find(Object.keys(query).length ? query : {}).sort({ monthYear: -1, type: 1 }).toArray();
    }

    let chartData: CategorySubcategoryDoc[] = (rawData as any[]).map((doc: any) => ({
      _id: String(doc._id ?? `${doc.monthYear}-${doc.type}`),
      category: doc.category ?? name,
      monthYear: doc.monthYear ?? '',
      type: doc.type ?? '',
      count: typeof doc.count === 'number' ? doc.count : 0,
    }));

    if (months > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);
      const cutoffMonthYear = cutoff.toISOString().slice(0, 7);
      chartData = chartData.filter((item) => item.monthYear >= cutoffMonthYear);
    }

    chartData.sort((a, b) => {
      if (a.monthYear !== b.monthYear) return a.monthYear.localeCompare(b.monthYear);
      return (a.type || '').localeCompare(b.type || '');
    });

    return NextResponse.json({
      specType: SPEC_BY_NAME[name] || name,
      data: chartData,
      dateRange: { start: startDate || 'earliest', end: endDate || 'latest' },
    });
  } catch (error) {
    console.error('Graph 3 API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
