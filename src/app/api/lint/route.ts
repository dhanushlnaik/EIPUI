import { lint } from "eipw-lint-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const template = body?.template;

    if (typeof template !== "string") {
      return NextResponse.json(
        { error: "Invalid template payload" },
        { status: 400 }
      );
    }

    const templateLines = template.split("\n");
    const lintResults = await lint(templateLines);

    if (lintResults.errors && lintResults.errors.length > 0) {
      return NextResponse.json({ errors: lintResults.errors }, { status: 400 });
    }

    return NextResponse.json({ message: "No lint errors." });
  } catch (error) {
    console.error("Linting Error:", error);
    return NextResponse.json(
      { error: "Error linting template" },
      { status: 500 }
    );
  }
}
