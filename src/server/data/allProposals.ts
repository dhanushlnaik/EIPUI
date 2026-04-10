import { prisma } from "@/lib/prisma";

type BaseRow = {
  eip: string;
  title: string | null;
  author: string | null;
  status: string;
  type: string;
  category: string;
  created: Date | null;
  deadline: string | null;
};

type RipRow = {
  eip: string;
  title: string | null;
  author: string | null;
  status: string;
  type: string;
  category: string;
  created: Date | null;
  deadline: null;
};

export type ProposalRow = {
  _id: string;
  eip: string;
  title: string | null;
  author: string | null;
  status: string;
  type: string;
  category: string;
  created: Date | null;
  deadline: string | null;
  repo: "eip" | "erc" | "rip";
};

export type AllProposalsResponse = {
  eip: ProposalRow[];
  erc: ProposalRow[];
  rip: ProposalRow[];
};

const withRepo = (rows: BaseRow[] | RipRow[], repo: "eip" | "erc" | "rip"): ProposalRow[] =>
  rows.map((row) => ({
    ...row,
    _id: `${repo}-${row.eip}`,
    repo,
  }));

export async function getAllProposals(): Promise<AllProposalsResponse> {
  const baseRows = await prisma.$queryRaw<BaseRow[]>`
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
  `;

  const ripRows = await prisma.$queryRaw<RipRow[]>`
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
      NULL::text AS deadline
    FROM rips rp
    WHERE rp.rip_number <> 0
    ORDER BY rp.rip_number ASC
  `;

  const eipRows = baseRows.filter((row) => row.category !== "ERC");
  const ercRows = baseRows.filter((row) => row.category === "ERC");

  return {
    eip: withRepo(eipRows, "eip"),
    erc: withRepo(ercRows, "erc"),
    rip: withRepo(ripRows, "rip"),
  };
}
