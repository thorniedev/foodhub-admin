// import { NextRequest, NextResponse } from "next/server";
// import { readData, writeData } from "../../../../lib/jsonDb";
// import { Banner } from "../../../../types/banner";

// const FILE = "banners.json";

// export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
//   const items = await readData<Banner>(FILE);
//   const item = items.find((b) => b.id === params.id);
//   if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
//   return NextResponse.json(item);
// }

// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   const body = await req.json();
//   const items = await readData<Banner>(FILE);
//   const index = items.findIndex((b) => b.id === params.id);
//   if (index === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
//   items[index] = { ...items[index], ...body };
//   await writeData(FILE, items);
//   return NextResponse.json(items[index]);
// }

// export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
//   const items = await readData<Banner>(FILE);
//   const filtered = items.filter((b) => b.id !== params.id);
//   await writeData(FILE, filtered);
//   return NextResponse.json({ id: params.id });
// }

import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "../../../../lib/jsonDb";
import { Banner } from "../../../../types/banner";

const FILE = "banners.json";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const items = await readData<Banner>(FILE);
  const item = items.find((b) => b.id === id);

  if (!item) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const items = await readData<Banner>(FILE);
  const index = items.findIndex((b) => b.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  items[index] = { ...items[index], ...body };
  await writeData(FILE, items);

  return NextResponse.json(items[index]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const items = await readData<Banner>(FILE);
  const filtered = items.filter((b) => b.id !== id);

  await writeData(FILE, filtered);

  return NextResponse.json({ id });
}
