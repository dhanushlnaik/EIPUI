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

const prDetailsSchema = new mongoose.Schema({
  prNumber: { type: Number },
  prTitle: { type: String },
  prDescription: { type: String },
  labels: { type: [String] },
  conversations: { type: [Object] },
  numConversations: { type: Number },
  participants: { type: [String] },
  numParticipants: { type: Number },
  commits: { type: [Object] },
  numCommits: { type: Number },
  filesChanged: { type: [String] },
  numFilesChanged: { type: Number },
  mergeDate: { type: Date },
});

const PrDetails = mongoose.models.PrDetails || mongoose.model("PrDetails", prDetailsSchema);

type Ctx = { params: { Type: string; number: string } };

const fetchConversations = async (type: string, number: number) => {
  let page = 1;
  let allConversations: any[] = [];

  while (true) {
    const conversationResponse = await axios.get(
      `https://api.github.com/repos/ethereum/${type}/pulls/${number}/comments`,
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

  while (true) {
    const conversationResponse = await axios.get(
      `https://api.github.com/repos/ethereum/${type}/issues/${number}/comments`,
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

const fetchCommits = async (type: string, number: number) => {
  const commitsResponse = await axios.get(
    `https://api.github.com/repos/ethereum/${type}/pulls/${number}/commits`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return commitsResponse.data;
};

const fetchFilesChanged = async (type: string, number: number) => {
  const filesResponse = await axios.get(
    `https://api.github.com/repos/ethereum/${type}/pulls/${number}/files`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return filesResponse.data?.map((file: { filename: string }) => file.filename);
};

const getParticipants = (conversations: any[], commits: any[]) => {
  const commentParticipants = conversations
    ?.filter((conversation) => conversation.user.login !== "github-actions[bot]")
    ?.map((conversation) => conversation.user.login);
  const commitParticipants = commits?.map((commit) => commit.committer.login);
  return Array.from(new Set([...commentParticipants, ...commitParticipants]));
};

const getParticipants2 = (conversations: any[]) => {
  if (conversations?.length === 0) return [];
  const commentParticipants = conversations
    ?.filter(
      (conversation) =>
        conversation.user && conversation.user.login && conversation.user.login !== "github-actions[bot]"
    )
    ?.map((conversation) => conversation.user.login);

  return Array.from(new Set(commentParticipants));
};

const processPRDetails = async (prData: any, type: string) => {
  const labels = prData.labels?.map((label: { name: string }) => label.name);
  const conversations = await fetchConversations(type, prData.number);
  const commits = await fetchCommits(type, prData.number);
  const participants = getParticipants(conversations, commits);
  const files = await fetchFilesChanged(type, prData.number);
  const mergeDate = prData.merged_at ? new Date(prData.merged_at) : null;

  const newPrDetails = new PrDetails({
    prNumber: prData.number,
    state: prData.status,
    prTitle: prData.title,
    prDescription: prData.body,
    labels,
    conversations,
    numConversations: conversations?.length,
    participants,
    numParticipants: participants?.length,
    commits,
    numCommits: commits?.length,
    filesChanged: files,
    numFilesChanged: files?.length,
    mergeDate,
  });

  await newPrDetails.save();
  return newPrDetails;
};

export async function GET(_request: Request, context: Ctx) {
  const { Type, number } = context.params;
  const typeString = Array.isArray(Type) ? Type[0] : Type || "";

  try {
    await ensureConnection();

    let prDetails: any = null;

    try {
      const prResponse = await axios.get(
        `https://api.github.com/repos/ethereum/${Type}/pulls/${number}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (prResponse.status === 200) {
        const issueDetails = await processPRDetails(prResponse.data, typeString);

        let state = prResponse.data.state;
        if (state === "closed" && prResponse.data.merged === true) {
          state = "merged";
        }

        const commentsResponse = await axios.get(
          `https://api.github.com/repos/ethereum/${Type}/pulls/${number}/reviews`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        let allConversations2 = commentsResponse.data;
        allConversations2 = allConversations2?.concat(commentsResponse);

        const participants2 = getParticipants2(allConversations2);
        const commitAuthor = issueDetails?.commits[0]?.author?.login;

        const mergedParticipants = new Set([
          ...issueDetails.participants,
          ...participants2,
          ...(commitAuthor ? [commitAuthor] : []),
        ]);

        const uniqueParticipantsArray = Array.from(mergedParticipants);
        issueDetails.participants = uniqueParticipantsArray;
        issueDetails.numParticipants = uniqueParticipantsArray?.length;

        prDetails = {
          type: "Pull Request",
          title: prResponse.data.title,
          state,
          url: prResponse.data.html_url,
          prDetails: issueDetails,
          reviewComments: commentsResponse.data,
        };
      }
    } catch (prError) {
      console.log(prError);
      console.log("not a pr, now checking for issues");
    }

    if (prDetails) {
      return NextResponse.json(prDetails);
    }

    return NextResponse.json({ error: "PR or open Issue not found" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
