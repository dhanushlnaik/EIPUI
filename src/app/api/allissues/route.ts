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
      issue_number: number;
      issue_title: string | null;
      repo: "EIPs" | "ERCs" | "RIPs";
    }>(`
      SELECT
        i.issue_number,
        i.title AS issue_title,
        CASE
          WHEN LOWER(SPLIT_PART(r.name, '/', 2)) = 'ercs' THEN 'ERCs'
          WHEN LOWER(SPLIT_PART(r.name, '/', 2)) = 'rips' THEN 'RIPs'
          ELSE 'EIPs'
        END AS repo
      FROM issues i
      JOIN repositories r ON r.id = i.repository_id
      WHERE LOWER(SPLIT_PART(r.name, '/', 2)) IN ('eips', 'ercs', 'rips')
      ORDER BY i.issue_number DESC
    `);

    const formattedIssueNumbers = result.rows.map((issue) => ({
      issueNumber: issue.issue_number,
      issueTitle: issue.issue_title || "",
      repo: issue.repo,
    }));

    return NextResponse.json(formattedIssueNumbers);
  } catch (error) {
    console.error("Error in /api/allissues:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
