import {
  getStatusTimelineV2,
  type StatusBucketItem,
  type StatusTimelineEvent,
} from "@/server/data/statusTimelineV2";

type RepoKey = "eip" | "erc" | "rip";

type LegacyStatusChangeItem = {
  _id: string;
  eip: string;
  fromStatus: string;
  toStatus: string;
  title: string;
  status: string;
  author: string;
  created: Date | null;
  changeDate: Date | null;
  type: string;
  category: string;
  discussion: string;
  deadline: Date | null;
  requires: string;
  pr: number | null;
  changedDay: number | null;
  changedMonth: number | null;
  changedYear: number | null;
  createdMonth: number | null;
  createdYear: number | null;
  __v: number;
  repo: RepoKey;
};

type LegacyStatusBucket = {
  _id: string;
  count: number;
  statusChanges: LegacyStatusChangeItem[];
  repo: RepoKey;
};

export type LegacyStatusChangesResponse = {
  eip: LegacyStatusBucket[];
  erc: LegacyStatusBucket[];
  rip: LegacyStatusBucket[];
};

function toLegacyEvent(event: StatusTimelineEvent): LegacyStatusChangeItem {
  const changeDate = event.changeDate ?? null;
  const created = event.created ?? null;

  return {
    _id: `${event.repo}-${event.eip}-${changeDate?.toISOString() ?? "na"}`,
    eip: event.eip,
    fromStatus: "",
    toStatus: event.status,
    title: event.title,
    status: event.status,
    author: event.author,
    created,
    changeDate,
    type: event.type,
    category: event.category,
    discussion: event.discussion,
    deadline: event.deadline,
    requires: "",
    pr: null,
    changedDay: changeDate ? changeDate.getUTCDate() : null,
    changedMonth: changeDate ? changeDate.getUTCMonth() + 1 : null,
    changedYear: changeDate ? changeDate.getUTCFullYear() : null,
    createdMonth: created ? created.getUTCMonth() + 1 : null,
    createdYear: created ? created.getUTCFullYear() : null,
    __v: 0,
    repo: event.repo,
  };
}

function bucketsToLegacy(
  buckets: StatusBucketItem[],
  repo: RepoKey,
  year: number,
  month?: number
): LegacyStatusBucket[] {
  return buckets
    .map((bucket) => {
      const events = bucket.eips
        .filter((entry) => {
          if (entry.year !== year) return false;
          if (typeof month === "number" && entry.month !== month) return false;
          return true;
        })
        .flatMap((entry) => entry.eips)
        .map(toLegacyEvent);

      return {
        _id: bucket.status,
        count: events.length,
        statusChanges: events,
        repo,
      };
    })
    .filter((bucket) => bucket.count > 0);
}

export async function getLegacyStatusChanges(
  year: number,
  month?: number
): Promise<LegacyStatusChangesResponse> {
  const timeline = await getStatusTimelineV2();

  return {
    eip: bucketsToLegacy(timeline.eip, "eip", year, month),
    erc: bucketsToLegacy(timeline.erc, "erc", year, month),
    rip: bucketsToLegacy(timeline.rip, "rip", year, month),
  };
}
