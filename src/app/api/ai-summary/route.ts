import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { eipNo, content } = body;
  if (!content || !eipNo) {
    return NextResponse.json({ error: "Missing eipNo or content" }, { status: 400 });
  }

  const supportedModels = ["command-a-03-2025", "command-r-plus-08-2024", "command-r-08-2024"];
  let lastError: any = null;

  for (const model of supportedModels) {
    try {
      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          message: `Analyze EIP ${eipNo} and create a concise, well-structured summary in 80-120 words.\n\n**Format your response with these sections:**\n\n**Purpose**\nWhat problem does this EIP solve? (1-2 sentences)\n\n**Technical Approach**\nKey changes or mechanisms introduced (2-3 key points)\n\n**Impact**\nHow it benefits developers, users, or the network (1-2 sentences)\n\n**Significance**\nWhy this EIP matters for Ethereum (1 sentence)\n\nKeep it concise, technical but accessible. Use bullet points for multiple items.\n\nEIP ${eipNo} Content:\n${content}`,
          temperature: 0.4,
          chat_history: [],
          connectors: [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        let summary = data.text || "No summary available.";

        summary = summary
          .trim()
          .replace(/^###\s*/gm, "")
          .replace(/^\*\*(.+?)\*\*$/gm, '<h4 class="font-semibold text-blue-400 mt-4 mb-2">$1</h4>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-300">$1</strong>')
          .replace(/^\d+\.\s+\*\*(.*?)\*\*:\s*/gm, '<div class="ml-4 mb-2"><strong class="text-green-400">$1:</strong> ')
          .replace(/^-\s+\*\*(.*?)\*\*:\s*/gm, '<div class="ml-4 mb-1"><strong class="text-purple-400">$1:</strong> ')
          .replace(/\n\n/g, '</div></p><p class="mb-3">')
          .replace(/\n/g, " ")
          .replace(/^(Purpose|Technical Approach|Benefits & Impact|Significance):\s*/gm, '<h4 class="font-semibold text-blue-400 mt-4 mb-2">$1</h4><p class="mb-3">');

        if (!summary.startsWith("<h4>") && !summary.startsWith("<p>")) {
          summary = `<p class="mb-3">${summary}</p>`;
        }

        summary = summary
          .replace(/<\/div><\/p>/g, "</div>")
          .replace(/<p class="mb-3"><\/p>/g, "")
          .replace(/\s+/g, " ")
          .trim();

        return NextResponse.json({ summary });
      }

      lastError = data;
      if (data.message?.includes("removed") || data.message?.includes("deprecated")) {
        continue;
      }

      return NextResponse.json({ error: data.message || "Cohere API error." }, { status: 500 });
    } catch (error) {
      lastError = error;
      console.error(`Error with model ${model}:`, error);
      continue;
    }
  }

  console.error("All models failed. Last error:", lastError);
  return NextResponse.json(
    { error: "Failed to generate summary with any available model. Please try again later." },
    { status: 500 }
  );
}
