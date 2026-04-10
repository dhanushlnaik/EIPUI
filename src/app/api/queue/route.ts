import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rustCommand = "cargo run";
  const rustProjectPath = path.resolve("C:/Users/Viwin/OneDrive/Desktop/EIP-Board");
  const envVars = {
    GITHUB_TOKEN: process.env.ACCESS_TOKEN,
    GITHUB_REPOSITORY: "ethereum/ERCs",
    ...process.env,
  };

  const urls = await new Promise<string[]>((resolve, reject) => {
    exec(rustCommand, { cwd: rustProjectPath, env: envVars }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      const urlPattern = /<a href="([^"]+)">/g;
      const result: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = urlPattern.exec(stdout)) !== null) {
        result.push(match[1]);
      }
      resolve(result);
    });
  });

  return NextResponse.json({ urls }, { status: 200 });
}
