import axios from "axios";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repositoryUrl = "https://api.github.com/repos/ethereum/RIPs";
    const response = await axios.get(repositoryUrl);

    const forksCount = response.data.forks_count;
    const watchlistCount = response.data.subscribers_count;
    const stars = response.data.stargazers_count;
    const openIssuesCount = response.data.open_issues_count;

    return NextResponse.json({
      forksCount,
      watchlistCount,
      stars,
      openIssuesCount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
