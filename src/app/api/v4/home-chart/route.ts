import { NextResponse } from "next/server";
import { Pool } from "pg";

type TimelineBreakdown = {
  key: string;
  count: number;
};

type TimelineYear = {
  year: number;
  total: number;
  breakdown: TimelineBreakdown[];
};

type ChartPoint = {
  year: number;
  value: number;
};

type CategoryPoint = ChartPoint & {
  category: string;
};

type StatusPoint = ChartPoint & {
  status: string;
};

declare global {
  // eslint-disable-next-line no-var
  var _homeChartPgPool: Pool | undefined;
}

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!global._homeChartPgPool) {
    global._homeChartPgPool = new Pool({
      connectionString: databaseUrl,
    });
  }
  return global._homeChartPgPool;
}

function flattenCategoryTimeline(timeline: TimelineYear[]): CategoryPoint[] {
  return timeline.flatMap((row) =>
    (row.breakdown || []).map((item) => ({
      year: Number(row.year),
      category: item.key || "Unknown",
      value: Number(item.count || 0),
    }))
  );
}

function flattenStatusTimeline(timeline: TimelineYear[]): StatusPoint[] {
  return timeline.flatMap((row) =>
    (row.breakdown || []).map((item) => ({
      year: Number(row.year),
      status: item.key || "Unknown",
      value: Number(item.count || 0),
    }))
  );
}

export async function GET() {
  try {
    const pool = getPool();

    const [categoryRowsRes, statusRowsRes] = await Promise.all([
      pool.query<{
        year: number | null;
        category: string;
        count: string;
      }>(
        `
        WITH CombinedProposals AS (
          SELECT
            EXTRACT(YEAR FROM e.created_at)::int AS year,
            CASE
              WHEN s.category IS NOT NULL AND s.category != '' THEN s.category
              WHEN s.type = 'Meta' THEN 'Meta'
              WHEN s.type = 'Informational' THEN 'Informational'
              ELSE 'Core'
            END AS category
          FROM eips e
          JOIN eip_snapshots s ON e.id = s.eip_id
          WHERE e.created_at IS NOT NULL
          UNION ALL
          SELECT
            EXTRACT(YEAR FROM created_at)::int AS year,
            'RIP' AS category
          FROM rips
          WHERE created_at IS NOT NULL
        )
        SELECT year, category, COUNT(*)::bigint AS count
        FROM CombinedProposals
        GROUP BY year, category
        ORDER BY year ASC, count DESC
        `
      ),
      pool.query<{
        year: number | null;
        status: string;
        count: string;
      }>(
        `
        WITH CombinedProposals AS (
          SELECT
            EXTRACT(YEAR FROM e.created_at)::int AS year,
            s.status AS status
          FROM eips e
          JOIN eip_snapshots s ON e.id = s.eip_id
          WHERE e.created_at IS NOT NULL
          UNION ALL
          SELECT
            EXTRACT(YEAR FROM created_at)::int AS year,
            status AS status
          FROM rips
          WHERE created_at IS NOT NULL
        )
        SELECT year, status, COUNT(*)::bigint AS count
        FROM CombinedProposals
        GROUP BY year, status
        ORDER BY year ASC, count DESC
        `
      ),
    ]);

    const categoryByYear = new Map<number, TimelineBreakdown[]>();
    categoryRowsRes.rows.forEach((row) => {
      if (row.year == null) return;
      const year = Number(row.year);
      const list = categoryByYear.get(year) || [];
      list.push({
        key: row.category || "Unknown",
        count: Number(row.count || 0),
      });
      categoryByYear.set(year, list);
    });

    const statusByYear = new Map<number, TimelineBreakdown[]>();
    statusRowsRes.rows.forEach((row) => {
      if (row.year == null) return;
      const year = Number(row.year);
      const list = statusByYear.get(year) || [];
      list.push({
        key: row.status || "Unknown",
        count: Number(row.count || 0),
      });
      statusByYear.set(year, list);
    });

    const categoryTimelineRaw: TimelineYear[] = Array.from(categoryByYear.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, breakdown]) => ({
        year,
        total: breakdown.reduce((acc, item) => acc + item.count, 0),
        breakdown,
      }));

    const statusTimelineRaw: TimelineYear[] = Array.from(statusByYear.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, breakdown]) => ({
        year,
        total: breakdown.reduce((acc, item) => acc + item.count, 0),
        breakdown,
      }));

    const categoryTimeline = flattenCategoryTimeline(categoryTimelineRaw || []);
    const statusTimeline = flattenStatusTimeline(statusTimelineRaw || []);

    return NextResponse.json({
      source: "postgres",
      categoryTimeline,
      statusTimeline,
    });
  } catch (error: any) {
    console.error("Failed to load postgres homepage chart data:", error?.message || error);
    return NextResponse.json(
      {
        source: "postgres",
        categoryTimeline: [],
        statusTimeline: [],
        error: error?.message || "Failed to fetch postgres homepage chart data",
      },
      { status: 502 }
    );
  }
}
