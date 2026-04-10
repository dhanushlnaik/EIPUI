import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getPulseStats(period: "daily" | "week" | "month") {
  const url = `https://github.com/ethereum/EIPs/pulse_diffstat_summary?period=${period}`;
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const infoContainer = $("div.color-fg-muted");
  const numAuthors = infoContainer.find("strong.color-fg-default").eq(0).text().trim();
  const commitsToMaster = infoContainer
    .find("strong.color-fg-default span.text-emphasized")
    .eq(0)
    .text()
    .trim();
  const commitsToAllBranches = infoContainer
    .find("strong.color-fg-default span.text-emphasized")
    .eq(1)
    .text()
    .trim();
  const filesChanged = infoContainer.find("strong.color-fg-default").eq(1).text().trim();
  const additions = infoContainer.find("strong.color-fg-success").text().trim();
  const deletions = infoContainer.find("strong.color-fg-danger").text().trim();

  return {
    numAuthors: parseInt(numAuthors, 10),
    commitsToMaster: parseInt(commitsToMaster, 10),
    commitsToAllBranches: parseInt(commitsToAllBranches, 10),
    filesChanged: parseInt(filesChanged, 10),
    additions: parseInt(additions, 10),
    deletions: parseInt(deletions, 10),
  };
}

export async function GET() {
  try {
    const info = await getPulseStats("daily");
    return NextResponse.json(info);
  } catch (error) {
    console.error("Pulse daily error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
