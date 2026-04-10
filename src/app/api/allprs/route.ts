import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    const db = getPool();

    const result = await db.query<{
      pr_number: number;
      pr_title: string | null;
      repo: "EIPs" | "ERCs" | "RIPs";
    }>(`
      SELECT
        pr.pr_number,
        pr.title AS pr_title,
        CASE
          WHEN LOWER(SPLIT_PART(r.name, '/', 2)) = 'ercs' THEN 'ERCs'
          WHEN LOWER(SPLIT_PART(r.name, '/', 2)) = 'rips' THEN 'RIPs'
          ELSE 'EIPs'
        END AS repo
      FROM pull_requests pr
      JOIN repositories r ON r.id = pr.repository_id
      WHERE LOWER(SPLIT_PART(r.name, '/', 2)) IN ('eips', 'ercs', 'rips')
      ORDER BY pr.pr_number DESC
    `);

    const formattedPrNumbers = result.rows.map((pr) => ({
      prNumber: pr.pr_number,
      prTitle: pr.pr_title || "",
      repo: pr.repo,
    }));

    return NextResponse.json(formattedPrNumbers);
  } catch (error) {
    console.error("Error in /api/allprs:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
