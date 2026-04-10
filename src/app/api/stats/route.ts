import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Counts = {
  eips: number | null;
  ercs: number | null;
  rips: number | null;
  prs: number | null;
  openPRs: number | null;
  contributors: number | null;
  repositories: number | null;
  labels: number | null;
};

export async function GET(request: Request) {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const searchParams = new URL(request.url).searchParams;

    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);

    if (searchParams.get("debug") === "true") {
      return NextResponse.json({ collections: names.sort() }, { status: 200 });
    }

    const maybeCount = async (name: string) => {
      if (!names.includes(name)) return 0;
      try {
        return await db.collection(name).countDocuments();
      } catch {
        return 0;
      }
    };

    const tryCollections = async (possibleNames: string[]): Promise<number> => {
      for (const name of possibleNames) {
        const count = await maybeCount(name);
        if (count > 0) return count;
      }
      return 0;
    };

    const eipsCount = await tryCollections(["eipmdfiles3s", "eips"]);
    const ercsCount = await tryCollections(["ercmdfiles3s", "ercs"]);
    const ripsCount = await tryCollections(["ripmdfiles3s", "rips"]);
    const alleipsprCount = await maybeCount("alleipsprdetails");
    const allercsprCount = await maybeCount("allercsprdetails");
    const allripsprCount = await maybeCount("allripsprdetails");
    const prsCount = (alleipsprCount + allercsprCount + allripsprCount) || (await maybeCount("prs"));
    const openPRsCount = await tryCollections(["openprs", "openPRs"]);
    const contributorsCount = await tryCollections(["contributors", "allcontributors"]);
    const repositoriesCount = (await tryCollections(["repositories", "repos"])) || 3;

    const counts: Counts = {
      eips: eipsCount,
      ercs: ercsCount,
      rips: ripsCount,
      prs: prsCount,
      openPRs: openPRsCount,
      contributors: contributorsCount,
      repositories: repositoriesCount,
      labels: await maybeCount("labels"),
    };

    return NextResponse.json({ source: "db", counts }, { status: 200 });
  } catch (error) {
    console.error("Stats API error:", error);
    const counts: Counts = {
      eips: null,
      ercs: null,
      rips: null,
      prs: null,
      openPRs: null,
      contributors: null,
      repositories: null,
      labels: null,
    };
    return NextResponse.json(
      { source: "fallback", counts, message: "Database unavailable" },
      { status: 200 }
    );
  }
}
