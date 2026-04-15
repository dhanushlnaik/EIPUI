import mongoose, { Connection, Document, Schema } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

async function getDbConn({ uri, dbName }: { uri: string; dbName: string }): Promise<Connection> {
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
  const mongodbUri = process.env.OPENPRS_MONGODB_URI;
  if (!mongodbUri) {
    return NextResponse.json({ error: "OPENPRS_MONGODB_URI is not defined" }, { status: 500 });
  }

  const url = new URL(request.url);
  const dbName = url.searchParams.get("db") || process.env.OPENPRS_DATABASE || "test";
  const rawLabelType = url.searchParams.get("labelType");
  const effectiveLabelType: "githubLabels" | "customLabels" =
    rawLabelType === "githubLabels" ? "githubLabels" : "customLabels";

  const collection = "open_erc_pr_snapshots";
  let conn: Connection | null = null;

  try {
    conn = await getDbConn({ uri: mongodbUri, dbName });
    const schema = new Schema<SnapDoc>({ month: String, prs: [{}] }, { strict: false });
    const Snap = conn.model<SnapDoc>("Snap", schema, collection);

    const snapshots = await Snap.find({}).read("primary").readConcern("majority").sort({ month: 1 }).lean();
    const rows: Row[] = [];

    for (const snap of snapshots) {
      const labelToPrs: Record<string, number[]> = {};
      for (const pr of snap.prs ?? []) {
        const labels = effectiveLabelType === "customLabels" ? pr.customLabels ?? [] : pr.githubLabels ?? [];
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
          const lowerLabels = labels.map((l) => l?.toLowerCase?.() ?? "");
          assigned = "Other Labels";
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

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Something went wrong" }, { status: 500 });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {}
    }
  }
}
