import { NextResponse } from "next/server";
import { Pool } from "pg";

let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getPool();

    const eipErcEvents = await db.query<{
      eip: string;
      title: string | null;
      author: string | null;
      from_status: string | null;
      to_status: string | null;
      change_date: Date;
      category: string | null;
      type: string | null;
      repo: "eip" | "erc";
    }>(`
      SELECT
        e.eip_number::text AS eip,
        e.title,
        e.author,
        se.from_status,
        se.to_status,
        se.changed_at AS change_date,
        COALESCE(NULLIF(s.category, ''), NULLIF(s.type, ''), 'Other') AS category,
        COALESCE(NULLIF(s.type, ''), 'Unknown') AS type,
        CASE
          WHEN LOWER(SPLIT_PART(COALESCE(r.name, ''), '/', 2)) = 'ercs' OR s.category = 'ERC'
            THEN 'erc'
          ELSE 'eip'
        END AS repo
      FROM eip_status_events se
      JOIN eips e ON e.id = se.eip_id
      LEFT JOIN eip_snapshots s ON s.eip_id = e.id
      LEFT JOIN repositories r ON r.id = COALESCE(se.repository_id, s.repository_id)
      WHERE e.eip_number <> 7212
      ORDER BY se.changed_at DESC
    `);

    const ripRows = await db.query<{
      eip: string;
      title: string | null;
      author: string | null;
      to_status: string | null;
      change_date: Date | null;
      category: string;
    }>(`
      SELECT
        rp.rip_number::text AS eip,
        rp.title,
        rp.author,
        rp.status AS to_status,
        rp.created_at AS change_date,
        CASE
          WHEN COALESCE(rp.title, '') ~* '\\mRRC[-\\s]?[0-9]+' OR COALESCE(rp.title, '') ~* '^RRC\\M'
            THEN 'RRC'
          ELSE 'RIP'
        END AS category
      FROM rips rp
      WHERE rp.rip_number <> 0
      ORDER BY rp.created_at DESC NULLS LAST
    `);

    const mapped = eipErcEvents.rows.map((row) => ({
      eip: row.eip,
      title: row.title || "",
      author: row.author || "",
      fromStatus: row.from_status || "",
      toStatus: row.to_status || "Unknown",
      status: row.to_status || "Unknown",
      changeDate: row.change_date,
      category: row.category || "Other",
      type: row.type || "Unknown",
      repo: row.repo,
    }));

    const eipResults = mapped.filter((row) => row.repo === "eip");
    const ercResults = mapped.filter((row) => row.repo === "erc");
    const ripResults = ripRows.rows.map((row) => ({
      eip: row.eip,
      title: row.title || "",
      author: row.author || "",
      fromStatus: "",
      toStatus: row.to_status || "Unknown",
      status: row.to_status || "Unknown",
      changeDate: row.change_date,
      category: row.category,
      type: "RIP",
      repo: "rip",
    }));

    return NextResponse.json({
      eip: eipResults,
      erc: ercResults,
      rip: ripResults,
    });
  } catch (error: any) {
    console.error("Error fetching status changes (graphsv4):", error?.message || error);
    return NextResponse.json(
      { error: "Error fetching status changes" },
      { status: 500 }
    );
  }
}
