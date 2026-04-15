import { NextResponse } from "next/server";
import { Pool } from "pg";

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

type StatusItem = {
  eip: string;
  lastStatus: string;
  eipTitle: string;
  eipCategory: string;
};

type StatusYearItem = StatusItem & {
  year: number;
};

type YearBucket = {
  year: number;
  statusChanges: StatusItem[];
  repo: "eip" | "erc" | "rip";
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getPool();

    const eipErcRows = await db.query<{
      year: number;
      eip: string;
      last_status: string;
      eip_title: string | null;
      eip_category: string | null;
      repo_kind: "eip" | "erc";
    }>(`
      WITH latest_snapshot AS (
        SELECT DISTINCT ON (s.eip_id)
          s.eip_id,
          s.repository_id,
          COALESCE(NULLIF(s.category, ''), NULLIF(s.type, ''), 'Core') AS category
        FROM eip_snapshots s
        ORDER BY s.eip_id, s.updated_at DESC
      ),
      ranked AS (
        SELECT
          EXTRACT(YEAR FROM se.changed_at)::int AS year,
          e.eip_number::text AS eip,
          COALESCE(NULLIF(se.to_status, ''), 'Unknown') AS last_status,
          e.title AS eip_title,
          COALESCE(ls.category, 'Core') AS eip_category,
          CASE
            WHEN LOWER(SPLIT_PART(COALESCE(r.name, ''), '/', 2)) = 'ercs' OR ls.category = 'ERC'
              THEN 'erc'
            ELSE 'eip'
          END AS repo_kind,
          ROW_NUMBER() OVER (
            PARTITION BY EXTRACT(YEAR FROM se.changed_at)::int, e.eip_number
            ORDER BY se.changed_at DESC, se.id DESC
          ) AS rn
        FROM eip_status_events se
        JOIN eips e ON e.id = se.eip_id
        LEFT JOIN latest_snapshot ls ON ls.eip_id = e.id
        LEFT JOIN repositories r ON r.id = COALESCE(se.repository_id, ls.repository_id)
        WHERE e.eip_number <> 7212
      )
      SELECT year, eip, last_status, eip_title, eip_category, repo_kind
      FROM ranked
      WHERE rn = 1
      ORDER BY year ASC, eip::int ASC
    `);

    const ripRows = await db.query<{
      year: number;
      eip: string;
      last_status: string;
      eip_title: string | null;
      eip_category: string;
    }>(`
      SELECT
        EXTRACT(YEAR FROM rp.created_at)::int AS year,
        rp.rip_number::text AS eip,
        COALESCE(NULLIF(rp.status, ''), 'Unknown') AS last_status,
        rp.title AS eip_title,
        CASE
          WHEN COALESCE(rp.title, '') ~* '\\mRRC[-\\s]?[0-9]+' OR COALESCE(rp.title, '') ~* '^RRC\\M'
            THEN 'RRC'
          ELSE 'RIP'
        END AS eip_category
      FROM rips rp
      WHERE rp.rip_number <> 0
        AND rp.created_at IS NOT NULL
      ORDER BY year ASC, rp.rip_number ASC
    `);

    const bucketByYear = (rows: StatusYearItem[], repo: YearBucket["repo"]): YearBucket[] => {
      const map = new Map<number, StatusItem[]>();
      for (const row of rows) {
        const year = row.year;
        const list = map.get(year) || [];
        list.push({
          eip: row.eip,
          lastStatus: row.lastStatus,
          eipTitle: row.eipTitle,
          eipCategory: row.eipCategory,
        });
        map.set(year, list);
      }
      return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([year, statusChanges]) => ({ year, statusChanges, repo }));
    };

    const eipItems = eipErcRows.rows
      .filter((row) => row.repo_kind === "eip")
      .map((row) => ({
        year: row.year,
        eip: row.eip,
        lastStatus: row.last_status,
        eipTitle: row.eip_title || "",
        eipCategory: row.eip_category || "Core",
      }));
    const ercItems = eipErcRows.rows
      .filter((row) => row.repo_kind === "erc")
      .map((row) => ({
        year: row.year,
        eip: row.eip,
        lastStatus: row.last_status,
        eipTitle: row.eip_title || "",
        eipCategory: row.eip_category || "ERC",
      }));
    const ripItems = ripRows.rows.map((row) => ({
      year: row.year,
      eip: row.eip,
      lastStatus: row.last_status,
      eipTitle: row.eip_title || "",
      eipCategory: row.eip_category,
    }));

    const eipFinal = bucketByYear(eipItems, "eip");
    const ercFinal = bucketByYear(ercItems, "erc");
    const ripFinal = bucketByYear(ripItems, "rip");

    return NextResponse.json({
      eip: eipFinal,
      erc: ercFinal,
      rip: ripFinal,
    });
  } catch (error: any) {
    console.log("Error:", error?.message || error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
