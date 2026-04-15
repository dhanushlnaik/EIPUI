import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const githubToken = process.env.ACCESS_TOKEN;
const repoOwner = "ethereum";
const repoName = "EIPs";

const CACHE_TTL = 1000 * 60 * 30;
const LOG_THROTTLE_MS = 1000 * 60 * 10;

let contributorsCache: { data: unknown[] | null; ts: number } = { data: null, ts: 0 };
let last403Log = 0;

type FetchError = { ok: false; status: number; statusText: string };

async function fetchContributors(
  url: string,
  headers: HeadersInit,
  allContributors: unknown[] = []
): Promise<unknown[] | FetchError> {
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      return { ok: false, status: response.status, statusText: response.statusText };
    }

    const contributors = (await response.json()) as unknown[];
    const merged = allContributors.concat(contributors);
    const linkHeader = response.headers.get("link");
    const hasNext = linkHeader && linkHeader.includes('rel="next"');

    if (!hasNext) return merged;

    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    if (!match?.[1]) return merged;
    return fetchContributors(match[1], headers, merged);
  } catch (error) {
    return {
      ok: false,
      status: 500,
      statusText: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  try {
    const now = Date.now();
    if (contributorsCache.data && now - contributorsCache.ts < CACHE_TTL) {
      return NextResponse.json(contributorsCache.data, { status: 200 });
    }

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`;
    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${githubToken || ""}`,
    };

    const allContributors = await fetchContributors(url, headers);

    if (!Array.isArray(allContributors)) {
      if (allContributors.status === 403) {
        const shouldLog = now - last403Log > LOG_THROTTLE_MS;
        if (shouldLog) {
          console.warn(
            "GitHub contributors fetch returned 403 (forbidden). Likely rate-limit or invalid token."
          );
          last403Log = now;
        }
        if (contributorsCache.data) {
          return NextResponse.json(contributorsCache.data, { status: 200 });
        }
        return NextResponse.json(
          {
            contributors: [],
            message: "GitHub API returned 403 (forbidden). Data temporarily unavailable.",
          },
          { status: 200 }
        );
      }

      console.warn("GitHub contributors fetch failed:", {
        status: allContributors.status,
        statusText: allContributors.statusText,
      });
      return NextResponse.json(
        { contributors: [], message: "GitHub contributors unavailable." },
        { status: 200 }
      );
    }

    contributorsCache = { data: allContributors, ts: now };
    return NextResponse.json(allContributors, { status: 200 });
  } catch (error) {
    console.error("Error in /api/allcontributors:", error);
    return NextResponse.json(
      { error: "Internal server error fetching contributors" },
      { status: 500 }
    );
  }
}
