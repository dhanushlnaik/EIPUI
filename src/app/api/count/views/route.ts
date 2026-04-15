import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const viewsFilePath = path.join(process.cwd(), '.next', 'cache', 'views.json');

type GlobalWithViews = typeof globalThis & { __viewsCount?: number };
const globalWithViews = globalThis as GlobalWithViews;

if (globalWithViews.__viewsCount === undefined) {
  globalWithViews.__viewsCount = 9000;
}

function persistViewsCount(count: number) {
  try {
    fs.mkdirSync(path.dirname(viewsFilePath), { recursive: true });
    fs.writeFileSync(viewsFilePath, JSON.stringify({ viewsCount: count }));
  } catch (err) {
    console.error('Failed to persist views count:', err);
  }
}

export async function GET() {
  return NextResponse.json({ viewsCount: globalWithViews.__viewsCount ?? 9000 });
}

export async function POST() {
  const nextCount = (globalWithViews.__viewsCount ?? 9000) + 1;
  globalWithViews.__viewsCount = nextCount;
  persistViewsCount(nextCount);
  return NextResponse.json({ viewsCount: nextCount });
}
