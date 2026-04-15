import axios from "axios";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  await mongoose.connect(uri);
}

const issueDetailsSchema = new mongoose.Schema({
  issueNumber: { type: Number },
  issueTitle: { type: String },
  issueDescription: { type: String },
  labels: { type: [String] },
  conversations: { type: [Object] },
  numConversations: { type: Number },
  participants: { type: [String] },
  numParticipants: { type: Number },
  state: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  closedAt: { type: Date },
});

const IssueDetails =
  mongoose.models.IssueDetails || mongoose.model("IssueDetails", issueDetailsSchema);

type Ctx = { params: { Type: string; number: string } };

const fetchIssueConversations = async (issueNumber: number) => {
  let page = 1;
  let allConversations: any[] = [];

  while (true) {
    const conversationResponse = await axios.get(
      `https://api.github.com/repos/ethereum/EIPs/issues/${issueNumber}/comments`,
      {
        params: { page, per_page: 100 },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const conversations = conversationResponse.data;
    allConversations = allConversations.concat(conversations);

    if (conversations.length < 100) break;
    page++;
  }

  return allConversations;
};

const getParticipants = (conversations: any[]) => {
  const commentParticipants = conversations
    ?.filter((conversation) => conversation.user?.login !== "github-actions[bot]")
    ?.map((conversation) => conversation.user?.login);

  return Array.from(new Set([...commentParticipants]));
};

const processIssueDetails = async (issueData: any) => {
  const labels = issueData.labels?.map((label: { name: string }) => label.name);
  const conversations = await fetchIssueConversations(issueData.number);
  const participants = getParticipants(conversations);

  const issueDetails = new IssueDetails({
    issueNumber: issueData.number,
    issueTitle: issueData.title,
    issueDescription: issueData.body,
    labels,
    conversations,
    numConversations: conversations?.length,
    participants,
    numParticipants: participants?.length,
    state: issueData.state,
    createdAt: new Date(issueData.created_at),
    updatedAt: new Date(issueData.updated_at),
    closedAt: issueData.closed_at ? new Date(issueData.closed_at) : null,
  });

  await issueDetails.save();
  return issueDetails;
};

export async function GET(_request: Request, context: Ctx) {
  const { Type, number } = context.params;
  const typeString = Array.isArray(Type) ? Type[0] : Type || "";

  try {
    await ensureConnection();

    const issueResponse = await axios.get(
      `https://api.github.com/repos/ethereum/${typeString}/issues/${number}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (issueResponse.status === 200) {
      const issueDetails = await processIssueDetails(issueResponse.data);
      return NextResponse.json({
        type: "Issue",
        title: issueDetails.issueTitle,
        state: issueDetails.state,
        url: issueResponse.data.html_url,
        issueDetails,
      });
    }

    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  } catch (error: any) {
    console.error("Error fetching issue details:", error?.message || error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
