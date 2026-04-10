import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getGitHubInsightsForMonth(owner: string, repo: string, year: number, month: number) {
  const octokit = new Octokit({ auth: process.env.ACCESS_TOKEN });
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const startISODate = startDate.toISOString();
  const endISODate = endDate.toISOString();

  let page = 1;
  let mergedPRsThisMonth: any[] = [];

  while (true) {
    const { data: mergedPRs } = await octokit.pulls.list({
      owner,
      repo,
      state: "closed",
      sort: "created",
      direction: "desc",
      per_page: 100,
      page,
    });

    const prsInDateRange = mergedPRs.filter(
      (pr: any) => pr.merged_at && new Date(pr.merged_at) >= startDate && new Date(pr.merged_at) <= endDate
    );
    mergedPRsThisMonth = mergedPRsThisMonth.concat(prsInDateRange);
    if (prsInDateRange.length < 100) break;
    page++;
  }

  const { data: openPRs } = await octokit.pulls.list({ owner, repo, state: "open", per_page: 100, page: 1 });
  const openPRsThisMonth = openPRs.filter(
    (pr: any) => new Date(pr.created_at) >= startDate && new Date(pr.created_at) <= endDate
  );

  const { data: closedIssues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "closed",
    sort: "created",
    direction: "desc",
    per_page: 100,
    page: 1,
  });
  const closedIssuesThisMonth = closedIssues.filter(
    (issue: any) => issue.closed_at && new Date(issue.closed_at) >= startDate && new Date(issue.closed_at) <= endDate
  );

  const { data: newIssues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "open",
    sort: "created",
    direction: "asc",
    per_page: 100,
    page: 1,
  });
  const newIssuesThisMonth = newIssues.filter(
    (issue: any) => new Date(issue.created_at) >= startDate && new Date(issue.created_at) <= endDate
  );

  const { data: commitsToMaster } = await octokit.repos.listCommits({
    owner,
    repo,
    sha: "master",
    since: startISODate,
    until: endISODate,
    per_page: 100,
    page: 1,
  });

  const { data: commitsToAllBranches } = await octokit.repos.listCommits({
    owner,
    repo,
    since: startISODate,
    until: endISODate,
    per_page: 100,
    page: 1,
  });

  const { data: contributors } = await octokit.repos.listContributors({ owner, repo, per_page: 100, page: 1 });

  let filesChanged = 0;
  let insertions = 0;
  let deletions = 0;

  for (const commit of commitsToAllBranches as any[]) {
    const { data: commitDetails } = await octokit.repos.getCommit({ owner, repo, ref: commit.sha });
    const files = (commitDetails as any).files;
    const stats = (commitDetails as any).stats;
    if (files && stats?.additions != null && stats?.deletions != null) {
      filesChanged += files.length;
      insertions += stats.additions;
      deletions += stats.deletions;
    }
  }

  return {
    mergedPRs: mergedPRsThisMonth.length,
    openPRs: openPRsThisMonth.length,
    closedIssues: closedIssuesThisMonth.length,
    newIssues: newIssuesThisMonth.length,
    commitsToMaster: commitsToMaster.length,
    commitsToAllBranches: commitsToAllBranches.length,
    contributors: contributors.length,
    filesChanged,
    insertions,
    deletions,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const year = parseInt(params.year, 10);
    const month = parseInt(params.month, 10);
    const result = await getGitHubInsightsForMonth("ethereum", "EIPs", year, month);
    return NextResponse.json(result);
  } catch (error) {
    console.error("ASC API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
