import { NextResponse } from "next/server";
import { Pool } from "pg";

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function GET() {
  try {
    const dbPool = getPool();

    // Mirror v4 category/source logic for EIP/ERC base rows.
    const baseResult = await dbPool.query<{
      eip: string;
      title: string | null;
      author: string | null;
      status: string;
      type: string;
      category: string;
      created: Date | null;
      deadline: string | null;
    }>(`
      SELECT
        e.eip_number::text AS eip,
        e.title,
        e.author,
        COALESCE(NULLIF(s.status, ''), 'Unknown') AS status,
        COALESCE(NULLIF(s.type, ''), 'Other') AS type,
        CASE
          WHEN s.category IS NOT NULL AND TRIM(s.category) <> '' THEN s.category
          WHEN TRIM(COALESCE(s.type, '')) <> '' THEN s.type
          ELSE 'Other'
        END AS category,
        e.created_at AS created,
        s.deadline::text AS deadline
      FROM eip_snapshots s
      JOIN eips e ON s.eip_id = e.id
      LEFT JOIN repositories r ON s.repository_id = r.id
      WHERE e.eip_number NOT IN (2512, 3297, 1047)
        AND LOWER(SPLIT_PART(COALESCE(r.name, ''), '/', 2)) IN ('eips', 'ercs')
      ORDER BY e.eip_number ASC
    `);

    // Query RIPs
    const ripResult = await dbPool.query<{
      eip: string;
      title: string | null;
      author: string | null;
      status: string;
      type: string;
      category: string;
      created: Date | null;
      deadline: null;
    }>(`
      SELECT
        rp.rip_number::text AS eip,
        rp.title,
        rp.author,
        COALESCE(NULLIF(rp.status, ''), 'Unknown') AS status,
        'RIP' AS type,
        CASE
          WHEN COALESCE(rp.title, '') ~* '\\mRRC[-\\s]?[0-9]+' OR COALESCE(rp.title, '') ~* '^RRC\\M' THEN 'RRC'
          ELSE 'RIP'
        END AS category,
        rp.created_at AS created,
        'rip' AS repo
      FROM rips rp
      WHERE rp.rip_number <> 0
      ORDER BY rp.rip_number ASC
    `);

    const mapResults = (rows: any[], repo: string) => rows.map((row: any) => ({
      ...row,
      _id: `${repo}-${row.eip}`, // Ensure a unique fake _id is maintained if the frontend uses it as key
      repo
    }));

    const eipRows = baseResult.rows.filter((row) => row.category !== "ERC");
    const ercRows = baseResult.rows.filter((row) => row.category === "ERC");

    return NextResponse.json({
      eip: mapResults(eipRows, 'eip'),
      erc: mapResults(ercRows, 'erc'),
      rip: mapResults(ripResult.rows, 'rip')
    });
  } catch (error: any) {
    console.error("Error retrieving standards from Postgres:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
