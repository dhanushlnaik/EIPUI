import { NextResponse } from "next/server";
import axios from "axios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Review = {
  state: string;
  user: {
    created_at: string;
  };
  submitted_at: string;
};

export async function GET(
  _request: Request,
  { params }: { params: { pr: string } }
) {
  const prNumber = parseInt(params.pr, 10);

  try {
    const response = await axios.get(
      `https://api.github.com/repos/ethereum/EIPs/pulls/${prNumber}/reviews`
    );
    const reviews = response.data as Review[];
    const editorReview = reviews.find((review) => review.state === "APPROVED");

    if (!editorReview) {
      return NextResponse.json({ error: "Editor review not found" }, { status: 404 });
    }

    const createdAt = new Date(editorReview.user.created_at);
    const submittedAt = new Date(editorReview.submitted_at);
    const hoursToEditorReview = (submittedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    return NextResponse.json({ prNumber, hoursToEditorReview });
  } catch (error) {
    console.error("Time-to-editor-review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
