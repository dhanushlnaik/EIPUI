import mongoose, { Connection, Document, Schema } from "mongoose";
import { NextResponse } from "next/server";

interface Pr {
  number: number;
  customLabels?: string[];
  githubLabels?: string[];
}

interface SnapDoc extends Document {
  month: string;
  prs?: Pr[];
}

interface Row {
  monthYear: string;
  label: string;
  count: number;
  labelType: string;
  prNumbers: number[];
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getDbConn({
  uri,
  dbName,
}: {
  uri: string;
  dbName: string;
}): Promise<Connection> {
  const conn = mongoose.createConnection(uri, {
    dbName,
    readPreference: "primary",
    readConcern: { level: "majority" },
    maxIdleTimeMS: 10000,
  });

  await new Promise<void>((resolve, reject) => {
    conn.once("open", () => resolve());
    conn.once("error", (err) => reject(err));
  });

  return conn;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mongodbUri = process.env.OPENPRS_MONGODB_URI!;
  const dbName = url.searchParams.get("db") || process.env.OPENPRS_DATABASE || "test";

  const collection = "open_pr_snapshots";
  const rawLabelType = url.searchParams.get("labelType") || undefined;
  const effectiveLabelType: "githubLabels" | "customLabels" =
    rawLabelType === "githubLabels" ? "githubLabels" : "customLabels";

  let conn: Connection | null = null;

  try {
    conn = await getDbConn({ uri: mongodbUri, dbName });

    const schema = new Schema<SnapDoc>({ month: String, prs: [{}] }, { strict: false });
    const Snap = conn.model<SnapDoc>("Snap", schema, collection);

    const snapshots: SnapDoc[] = await Snap.find({})
      .read("primary")
      .readConcern("majority")
      .sort({ month: 1 })
      .lean();

    const rows: Row[] = [];

    for (const snap of snapshots) {
      const labelToPrs: Record<string, number[]> = {};

      for (const pr of snap.prs ?? []) {
        const labels: string[] =
          effectiveLabelType === "customLabels" ? pr.customLabels ?? [] : pr.githubLabels ?? [];

        let assigned: string;

        if (effectiveLabelType === "customLabels") {
          assigned = "Misc";
          if (labels.includes("Typo Fix")) assigned = "Typo Fix";
          else if (labels.includes("Status Change")) assigned = "Status Change";
          else if (labels.includes("EIP Update")) assigned = "EIP Update";
          else if (labels.includes("ERC Update")) assigned = "ERC Update";
          else if (labels.includes("Created By Bot")) assigned = "Created By Bot";
          else if (labels.includes("New EIP")) assigned = "New EIP";
          else if (labels.includes("New ERC")) assigned = "New ERC";
        } else {
          assigned = "Other Labels";
          const lowerLabels = labels.map((l) => l?.toLowerCase?.() ?? "");
          for (const lbl of lowerLabels) {
            assigned = lbl;
            break;
          }
        }

        if (!labelToPrs[assigned]) labelToPrs[assigned] = [];
        labelToPrs[assigned].push(pr.number);
      }

      for (const [label, prNumbers] of Object.entries(labelToPrs)) {
        rows.push({
          monthYear: snap.month,
          label,
          count: prNumbers.length,
          labelType: effectiveLabelType,
          prNumbers,
        });
      }
    }

    await conn.close();
    return NextResponse.json(rows);
  } catch (error: any) {
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
    console.error("[API ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
