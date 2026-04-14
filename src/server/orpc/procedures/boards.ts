import { publicProcedure } from "./types";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ──── Helper: Map repo to repository IDs ────
async function getRepoIds(repo?: string): Promise<number[] | null> {
  if (!repo) return null;
  
  const repoMap: Record<string, string> = {
    eips: "ethereum/EIPs",
    ercs: "ethereum/ERCs",
    rips: "ethereum/RIPs",
  };

  const repoName = repoMap[repo];
  if (!repoName) return null;

  const repos = await prisma.repository.findMany({
    where: { name: repoName },
    select: { id: true },
  });

  return repos.length > 0 ? repos.map((r) => r.id) : null;
}

// ──── SQL for determining PROCESS_TYPE ────
const PROCESS_TYPE_SQL = `
  CASE
    WHEN gs.category = 'Core' THEN 'Core'
    WHEN gs.category = 'Networking' THEN 'Networking'
    WHEN gs.category = 'Interface' THEN 'Interface'
    ELSE 'Other'
  END
`;

export const boardProcedures = {
  // ──── Board: EIP/ERC/RIP data ────
  getBoardData: publicProcedure
    .input(
      z.object({
        repo: z.enum(["eips", "ercs", "rips"]).optional(),
        search: z.string().optional(),
        type: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const repoIds = await getRepoIds(input.repo);

      const searchFilter = input.search
        ? `AND (ei.eip_number::text LIKE '%${input.search.replace(/'/g, "''")}%' OR LOWER(ei.title) LIKE '%${input.search.toLowerCase().replace(/'/g, "''")}%')`
        : "";
      const typeFilter = input.type
        ? `AND s.type = '${input.type.replace(/'/g, "''")}'`
        : "";
      const catFilter = input.category
        ? `AND s.category = '${input.category.replace(/'/g, "''")}'`
        : "";

      const results = await prisma.$queryRawUnsafe<
        Array<{
          eip_number: number;
          title: string | null;
          status: string;
          type: string | null;
          category: string | null;
          author: string | null;
          repo_type: string;
          created_at: string | null;
          updated_at: string | null;
        }>
      >(
        `SELECT
          ei.eip_number,
          ei.title,
          s.status,
          s.type,
          s.category,
          ei.author,
          COALESCE(LOWER(r.type), 'unknown') AS repo_type,
          TO_CHAR(ei.created_at, 'YYYY-MM-DD') AS created_at,
          TO_CHAR(s.updated_at, 'YYYY-MM-DD') AS updated_at
        FROM eip_snapshots s
        JOIN eips ei ON s.eip_id = ei.id
        LEFT JOIN repositories r ON s.repository_id = r.id
        WHERE ($1::int[] IS NULL OR s.repository_id = ANY($1))
          ${searchFilter}
          ${typeFilter}
          ${catFilter}
        ORDER BY s.status, ei.eip_number DESC`,
        repoIds
      );

      // Group by status
      const statuses = [
        "Draft",
        "Review",
        "Last Call",
        "Final",
        "Stagnant",
        "Withdrawn",
        "Living",
      ];
      const board: Record<
        string,
        Array<{
          eipNumber: number;
          title: string | null;
          type: string | null;
          category: string | null;
          author: string | null;
          repo: string;
          createdAt: string | null;
          updatedAt: string | null;
        }>
      > = {};

      for (const s of statuses) board[s] = [];

      for (const r of results) {
        const key = statuses.includes(r.status) ? r.status : "Draft";
        board[key].push({
          eipNumber: r.eip_number,
          title: r.title,
          type: r.type,
          category: r.category,
          author: r.author,
          repo: r.repo_type,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        });
      }

      return board;
    }),

  // ──── Board filter options ────
  getBoardFilterOptions: publicProcedure
    .input(
      z.object({
        repo: z.enum(["eips", "ercs", "rips"]).optional(),
      })
    )
    .handler(async ({ input }) => {
      const repoIds = await getRepoIds(input.repo);

      const types = await prisma.$queryRawUnsafe<Array<{ val: string }>>(
        `SELECT DISTINCT s.type AS val FROM eip_snapshots s
         WHERE s.type IS NOT NULL AND ($1::int[] IS NULL OR s.repository_id = ANY($1))
         ORDER BY val`,
        repoIds
      );

      const categories = await prisma.$queryRawUnsafe<Array<{ val: string }>>(
        `SELECT DISTINCT s.category AS val FROM eip_snapshots s
         WHERE s.category IS NOT NULL AND ($1::int[] IS NULL OR s.repository_id = ANY($1))
         ORDER BY val`,
        repoIds
      );

      return {
        types: types.map((t) => t.val),
        categories: categories.map((c) => c.val),
      };
    }),

  // ──── Open PRs Board: paginated list with governance state & classification ────
  getOpenPRBoard: publicProcedure
    .input(
      z.object({
        repo: z.enum(["eips", "ercs", "rips"]).optional(),
        govState: z.union([z.string(), z.array(z.string())]).optional(),
        processType: z.union([z.string(), z.array(z.string())]).optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(10),
      })
    )
    .handler(async ({ input }) => {
      const { repo, govState, processType, search, page, pageSize } = input;
      const offset = (page - 1) * pageSize;
      const govStates = typeof govState === "string" ? [govState] : govState ?? [];
      const processTypes =
        typeof processType === "string" ? [processType] : processType ?? [];

      const results = await prisma.$queryRawUnsafe<
        Array<{
          pr_number: number;
          title: string | null;
          author: string | null;
          created_at: string;
          labels: string[];
          repo_name: string;
          repo_short: string;
          gov_state: string;
          wait_days: number;
          process_type: string;
          total_count: bigint;
        }>
      >(
        `
        WITH base AS (
          SELECT
            p.pr_number,
            p.title,
            p.author,
            TO_CHAR(p.created_at, 'YYYY-MM-DD') AS created_at,
            p.labels,
            r.name AS repo_name,
            LOWER(SPLIT_PART(r.name, '/', 2)) AS repo_short,
            COALESCE(
              gs.subcategory,
              CASE COALESCE(gs.current_state, 'NO_STATE')
                WHEN 'WAITING_ON_EDITOR' THEN 'Waiting on Editor'
                WHEN 'WAITING_ON_AUTHOR' THEN 'Waiting on Author'
                WHEN 'DRAFT' THEN 'AWAITED'
                ELSE 'Uncategorized'
              END
            ) AS gov_state,
            GREATEST(EXTRACT(DAY FROM (NOW() - COALESCE(gs.waiting_since, p.created_at, NOW())))::int, 0) AS wait_days,
            COALESCE(gs.category, ${PROCESS_TYPE_SQL}) AS process_type
          FROM pull_requests p
          JOIN repositories r ON p.repository_id = r.id
          LEFT JOIN pr_governance_state gs
            ON p.pr_number = gs.pr_number AND p.repository_id = gs.repository_id
          WHERE p.state = 'open'
            AND ($1::text IS NULL OR LOWER(SPLIT_PART(r.name, '/', 2)) = LOWER($1))
        ),
        filtered AS (
          SELECT * FROM base
          WHERE ($2::text[] IS NULL OR cardinality($2::text[]) = 0 OR gov_state = ANY($2::text[]))
            AND ($3::text[] IS NULL OR cardinality($3::text[]) = 0 OR process_type = ANY($3::text[]))
            AND ($4::text IS NULL OR (
              pr_number::text LIKE '%' || $4 || '%'
              OR LOWER(COALESCE(title, '')) LIKE '%' || LOWER($4) || '%'
              OR LOWER(COALESCE(author, '')) LIKE '%' || LOWER($4) || '%'
            ))
        )
        SELECT f.*, (SELECT COUNT(*) FROM filtered)::bigint AS total_count
        FROM filtered f
        ORDER BY f.wait_days DESC
        LIMIT $5 OFFSET $6
      `,
        repo || null,
        govStates.length ? govStates : null,
        processTypes.length ? processTypes : null,
        search || null,
        pageSize,
        offset
      );

      const total = results.length > 0 ? Number(results[0].total_count) : 0;

      return {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
        rows: results.map((r) => ({
          prNumber: r.pr_number,
          title: r.title,
          author: r.author,
          createdAt: r.created_at,
          labels: Array.isArray(r.labels) ? r.labels : [],
          repo: r.repo_name,
          repoShort: r.repo_short,
          govState: r.gov_state,
          waitDays: r.wait_days,
          processType: r.process_type,
        })),
      };
    }),

  // ──── Open PRs Board Stats: process type + governance state counts ────
  getOpenPRBoardStats: publicProcedure
    .input(
      z.object({
        repo: z.enum(["eips", "ercs", "rips"]).optional(),
        govState: z.union([z.string(), z.array(z.string())]).optional(),
        search: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { repo, govState, search } = input;
      const govStates = typeof govState === "string" ? [govState] : govState ?? [];

      // Process type counts (filtered by govState + search, NOT by processType)
      const ptResults = await prisma.$queryRawUnsafe<
        Array<{
          process_type: string;
          count: bigint;
        }>
      >(
        `
        WITH base AS (
          SELECT
            p.pr_number, p.title, p.author,
            COALESCE(
              gs.subcategory,
              CASE COALESCE(gs.current_state, 'NO_STATE')
                WHEN 'WAITING_ON_EDITOR' THEN 'Waiting on Editor'
                WHEN 'WAITING_ON_AUTHOR' THEN 'Waiting on Author'
                WHEN 'DRAFT' THEN 'AWAITED'
                ELSE 'Uncategorized'
              END
            ) AS gov_state,
            COALESCE(gs.category, ${PROCESS_TYPE_SQL}) AS process_type
          FROM pull_requests p
          JOIN repositories r ON p.repository_id = r.id
          LEFT JOIN pr_governance_state gs
            ON p.pr_number = gs.pr_number AND p.repository_id = gs.repository_id
          WHERE p.state = 'open'
            AND ($1::text IS NULL OR LOWER(SPLIT_PART(r.name, '/', 2)) = LOWER($1))
        )
        SELECT process_type, COUNT(*)::bigint AS count
        FROM base
        WHERE ($2::text[] IS NULL OR cardinality($2::text[]) = 0 OR gov_state = ANY($2::text[]))
          AND ($3::text IS NULL OR (
            pr_number::text LIKE '%' || $3 || '%'
            OR LOWER(COALESCE(title, '')) LIKE '%' || LOWER($3) || '%'
            OR LOWER(COALESCE(author, '')) LIKE '%' || LOWER($3) || '%'
          ))
        GROUP BY process_type
        ORDER BY count DESC
      `,
        repo || null,
        govStates.length ? govStates : null,
        search || null
      );

      // Governance state counts (NOT filtered by govState—so user sees all state counts)
      const gsResults = await prisma.$queryRawUnsafe<
        Array<{
          state: string;
          label: string;
          count: bigint;
        }>
      >(
        `
        SELECT
          COALESCE(
            gs.subcategory,
            CASE COALESCE(gs.current_state, 'NO_STATE')
              WHEN 'WAITING_ON_EDITOR' THEN 'Waiting on Editor'
              WHEN 'WAITING_ON_AUTHOR' THEN 'Waiting on Author'
              WHEN 'DRAFT' THEN 'AWAITED'
              ELSE 'Uncategorized'
            END
          ) AS state,
          COALESCE(
            gs.subcategory,
            CASE COALESCE(gs.current_state, 'NO_STATE')
              WHEN 'WAITING_ON_EDITOR' THEN 'Waiting on Editor'
              WHEN 'WAITING_ON_AUTHOR' THEN 'Waiting on Author'
              WHEN 'DRAFT' THEN 'AWAITED'
              ELSE 'Uncategorized'
            END
          ) AS label,
          COUNT(*)::bigint AS count
        FROM pull_requests p
        JOIN repositories r ON p.repository_id = r.id
        LEFT JOIN pr_governance_state gs
          ON p.pr_number = gs.pr_number AND p.repository_id = gs.repository_id
        WHERE p.state = 'open'
          AND ($1::text IS NULL OR LOWER(SPLIT_PART(r.name, '/', 2)) = LOWER($1))
          AND ($2::text IS NULL OR (
            p.pr_number::text LIKE '%' || $2 || '%'
            OR LOWER(COALESCE(p.title, '')) LIKE '%' || LOWER($2) || '%'
            OR LOWER(COALESCE(p.author, '')) LIKE '%' || LOWER($2) || '%'
          ))
        GROUP BY state, label
        ORDER BY count DESC
      `,
        repo || null,
        search || null
      );

      return {
        processTypes: ptResults.map((r) => ({
          type: r.process_type,
          count: Number(r.count),
        })),
        govStates: gsResults.map((r) => ({
          state: r.state,
          label: r.label,
          count: Number(r.count),
        })),
        totalOpen: gsResults.reduce((sum, r) => sum + Number(r.count), 0),
      };
    }),
};
