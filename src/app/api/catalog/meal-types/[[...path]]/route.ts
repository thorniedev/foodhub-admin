import type { NextRequest } from "next/server";

import {
  proxyCatalogRequest,
  type CatalogProxyContext,
} from "../../_shared/proxyCatalogRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESOURCE = "meal-types";

export async function GET(request: NextRequest, context: CatalogProxyContext) {
  return proxyCatalogRequest(request, context, RESOURCE);
}

export async function POST(request: NextRequest, context: CatalogProxyContext) {
  return proxyCatalogRequest(request, context, RESOURCE);
}

export async function PUT(request: NextRequest, context: CatalogProxyContext) {
  return proxyCatalogRequest(request, context, RESOURCE);
}

export async function PATCH(request: NextRequest, context: CatalogProxyContext) {
  return proxyCatalogRequest(request, context, RESOURCE);
}

export async function DELETE(request: NextRequest, context: CatalogProxyContext) {
  return proxyCatalogRequest(request, context, RESOURCE);
}
