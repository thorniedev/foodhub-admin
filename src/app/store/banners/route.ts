import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readData, writeData } from "../../../lib/jsonDb";
import { Banner } from "../../../types/banner";

const FILE = "banners.json";

export async function GET() {
  const items = await readData<Banner>(FILE);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = await readData<Banner>(FILE);
  const newItem: Banner = { id: randomUUID(), createdAt: new Date().toISOString(), ...body };
  items.push(newItem);
  await writeData(FILE, items);
  return NextResponse.json(newItem, { status: 201 });
}
