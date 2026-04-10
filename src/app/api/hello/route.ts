import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { pathname, search } = new URL(request.url);
  return NextResponse.json({ oka: `${pathname}${search}` }, { status: 200 });
}
