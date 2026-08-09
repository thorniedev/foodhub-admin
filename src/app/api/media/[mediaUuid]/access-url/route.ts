import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    mediaUuid: string;
  }>;
}

function getBackendApiUrl():
  | string
  | null {
  const configured = (
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL
  )?.replace(/\/+$/, "");

  if (!configured) {
    return null;
  }

  return /\/api\/v1$/i.test(
    configured,
  )
    ? configured
    : `${configured}/api/v1`;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const backendApiUrl =
    getBackendApiUrl();

  if (!backendApiUrl) {
    return NextResponse.json(
      {
        message:
          "Backend API URL is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const accessToken =
    request.cookies.get(
      "foodhub_access_token",
    )?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        message:
          "Admin session is missing or expired.",
      },
      {
        status: 401,
      },
    );
  }

  const { mediaUuid } =
    await context.params;

  try {
    const response = await fetch(
      `${backendApiUrl}/media/${encodeURIComponent(
        mediaUuid,
      )}/access-url`,
      {
        method: "GET",

        headers: {
          Accept: "application/json",

          Authorization:
            `Bearer ${accessToken}`,
        },

        cache: "no-store",
      },
    );

    const body =
      await response.arrayBuffer();

    return new Response(body, {
      status: response.status,

      headers: {
        "Content-Type":
          response.headers.get(
            "content-type",
          ) ??
          "application/json",
      },
    });
  } catch (error) {
    console.error(
      "[MEDIA ACCESS URL ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Could not load media access URL.",
      },
      {
        status: 502,
      },
    );
  }
}