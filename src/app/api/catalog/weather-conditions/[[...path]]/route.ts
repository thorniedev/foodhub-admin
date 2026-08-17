import type { NextRequest } from "next/server";

import {
  proxyCatalogRequest,
  type CatalogProxyContext,
} from "../../_shared/proxyCatalogRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESOURCE = "weather-conditions";

export function GET(
  request: NextRequest,
  context: CatalogProxyContext,
) {
  return proxyCatalogRequest(
    request,
    context,
    RESOURCE,
  );
}

export function POST(
  request: NextRequest,
  context: CatalogProxyContext,
) {
  return proxyCatalogRequest(
    request,
    context,
    RESOURCE,
  );
}

export function PUT(
  request: NextRequest,
  context: CatalogProxyContext,
) {
  return proxyCatalogRequest(
    request,
    context,
    RESOURCE,
  );
}

export function PATCH(
  request: NextRequest,
  context: CatalogProxyContext,
) {
  return proxyCatalogRequest(
    request,
    context,
    RESOURCE,
  );
}

export function DELETE(
  request: NextRequest,
  context: CatalogProxyContext,
) {
  return proxyCatalogRequest(
    request,
    context,
    RESOURCE,
  );
}
