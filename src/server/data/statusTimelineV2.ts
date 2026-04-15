import { prisma } from "@/lib/prisma";

export type StatusTimelineEvent = {
  eip: string;
  title: string;
  author: string;
  status: string;
  type: string;
  category: string;
  created: Date | null;
  deadline: Date | null;
  discussion: string;
  changeDate: Date | null;
  repo: "eip" | "erc" | "rip";
};

export type StatusBucketItem = {
  status: string;
  eips: Array<{
    category: string;
    month: number;
    year: number;
    date: string;
    count: number;
    eips: StatusTimelineEvent[];
    repo: "eip" | "erc" | "rip";
  }>;
};

export type StatusTimelineV2Response = {
  eip: StatusBucketItem[];
  erc: StatusBucketItem[];
  rip: StatusBucketItem[];
};

function pushGrouped(
  map: Map<string, StatusBucketItem>,
  row: {
    status: string;
    category: string;
    month: number;
    year: number;
    repo: "eip" | "erc" | "rip";
  },
  eventPayload: StatusTimelineEvent
) {
  const statusKey = row.status || "Unknown";
  const date = `${row.year}-${row.month}`;
  let statusBucket = map.get(statusKey);
  if (!statusBucket) {
    statusBucket = { status: statusKey, eips: [] };
    map.set(statusKey, statusBucket);
  }

  const existing = statusBucket.eips.find(
    (item) =>
      item.category === row.category &&
      item.month === row.month &&
      item.year === row.year &&
      item.repo === row.repo
  );

  if (existing) {
    existing.eips.push(eventPayload);
    existing.count = existing.eips.length;
  } else {
    statusBucket.eips.push({
      category: row.category,
      month: row.month,
      year: row.year,
      date,
      count: 1,
      eips: [eventPayload],
      repo: row.repo,
    });
  }
}

export async function getStatusTimelineV2(): Promise<StatusTimelineV2Response> {
  const eipErcRows = await prisma.$queryRaw<
    Array<{
      eip: string;
      title: string | null;
      author: string | null;
      status: string;
      type: string | null;
      category: string | null;
      created: Date | null;
      deadline: Date | null;
      discussion: string | null;
      change_date: Date;
      changed_year: number;
      changed_month: number;
      repo: "eip" | "erc";
    }>
  >`
    SELECT
      e.eip_number::text AS eip,
      e.title,
      e.author,
      COALESCE(NULLIF(se.to_status, ''), 'Unknown') AS status,
      s.type,
      COALESCE(NULLIF(s.category, ''), NULLIF(s.type, ''), 'Other') AS category,
      e.created_at AS created,
      s.deadline,
      NULL::text AS discussion,
      se.changed_at AS change_date,
      EXTRACT(YEAR FROM se.changed_at)::int AS changed_year,
      EXTRACT(MONTH FROM se.changed_at)::int AS changed_month,
      CASE
        WHEN LOWER(SPLIT_PART(COALESCE(r.name, ''), '/', 2)) = 'ercs' OR s.category = 'ERC'
          THEN 'erc'
        ELSE 'eip'
      END AS repo
    FROM eip_status_events se
    JOIN eips e ON e.id = se.eip_id
    LEFT JOIN eip_snapshots s ON s.eip_id = e.id
    LEFT JOIN repositories r ON r.id = COALESCE(se.repository_id, s.repository_id)
    WHERE e.eip_number NOT IN (2512, 3297, 1047)
    ORDER BY se.changed_at ASC
  `;

  const ripRows = await prisma.$queryRaw<
    Array<{
      eip: string;
      title: string | null;
      author: string | null;
      status: string | null;
      created: Date | null;
      category: string;
      changed_year: number;
      changed_month: number;
    }>
  >`
    SELECT
      rp.rip_number::text AS eip,
      rp.title,
      rp.author,
      rp.status,
      rp.created_at AS created,
      CASE
        WHEN COALESCE(rp.title, '') ~* '\\mRRC[-\\s]?[0-9]+' OR COALESCE(rp.title, '') ~* '^RRC\\M'
          THEN 'RRC'
        ELSE 'RIP'
      END AS category,
      EXTRACT(YEAR FROM rp.created_at)::int AS changed_year,
      EXTRACT(MONTH FROM rp.created_at)::int AS changed_month
    FROM rips rp
    WHERE rp.rip_number <> 0
      AND rp.created_at IS NOT NULL
    ORDER BY rp.created_at ASC
  `;

  const eipMap = new Map<string, StatusBucketItem>();
  const ercMap = new Map<string, StatusBucketItem>();
  const ripMap = new Map<string, StatusBucketItem>();

  for (const row of eipErcRows) {
    const baseRow = {
      status: row.status || "Unknown",
      category: row.category || "Other",
      month: row.changed_month,
      year: row.changed_year,
      repo: row.repo,
    } as const;

    const payload: StatusTimelineEvent = {
      eip: row.eip,
      title: row.title || "",
      author: row.author || "",
      status: row.status || "Unknown",
      type: row.type || "Unknown",
      category: row.category || "Other",
      created: row.created,
      deadline: row.deadline,
      discussion: row.discussion || "",
      changeDate: row.change_date,
      repo: row.repo,
    };

    if (row.repo === "erc") {
      pushGrouped(ercMap, baseRow, payload);
    } else {
      pushGrouped(eipMap, baseRow, payload);
    }
  }

  for (const row of ripRows) {
    const payload: StatusTimelineEvent = {
      eip: row.eip,
      title: row.title || "",
      author: row.author || "",
      status: row.status || "Unknown",
      type: "RIP",
      category: row.category,
      created: row.created,
      deadline: null,
      discussion: "",
      changeDate: row.created,
      repo: "rip",
    };

    pushGrouped(
      ripMap,
      {
        status: row.status || "Unknown",
        category: row.category,
        month: row.changed_month,
        year: row.changed_year,
        repo: "rip",
      },
      payload
    );
  }

  const toSortedArray = (map: Map<string, StatusBucketItem>) =>
    Array.from(map.values())
      .map((item) => ({
        ...item,
        eips: item.eips.sort((a, b) => (a.date === b.date ? 0 : a.date > b.date ? 1 : -1)),
      }))
      .sort((a, b) => a.status.localeCompare(b.status));

  return {
    eip: toSortedArray(eipMap),
    erc: toSortedArray(ercMap),
    rip: toSortedArray(ripMap),
  };
}
