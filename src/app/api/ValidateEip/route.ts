import * as eipw from "eipw-lint-js";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ValidationRequest {
  markdownContent: string;
}

export async function POST(request: Request) {
  let body: ValidationRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { markdownContent } = body;
  if (!markdownContent) {
    return NextResponse.json(
      { success: false, error: "Markdown content is required" },
      { status: 400 }
    );
  }

  const tempDir = path.join(process.cwd(), "temp");
  const uniqueId = Date.now() + "-" + Math.random().toString(36).substring(2, 12);
  const tempFilePath = path.join(tempDir, `temp_eip_${uniqueId}.md`);

  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    await fs.promises.writeFile(tempFilePath, markdownContent);

    const options = { deny: [], warn: [], allow: [] };
    const result = await eipw.lint([tempFilePath], options);

    let hasErrors = false;
    const messages: Array<{ level: string; message: string }> = [];
    for (const snippet of result) {
      const formatted = eipw.format(snippet);
      messages.push({ level: snippet.level, message: formatted });
      if (snippet.level === "Error") hasErrors = true;
    }

    if (hasErrors) {
      return NextResponse.json({ success: false, messages }, { status: 400 });
    }

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Error during validation:", error);
    return NextResponse.json({ success: false, error: "Validation failed" }, { status: 500 });
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath);
      }
    } catch {}
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
}
