import type {
  NextRequest,
} from "next/server";

import {
  NextResponse,
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function getBackendApiBaseUrl(): string {
  const configured =
    process.env
      .BACKEND_API_URL ||
    process.env
      .NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:7070/api/v1";

  const clean =
    configured
      .trim()
      .replace(
        /\/+$/,
        "",
      );

  if (
    clean.endsWith(
      "/api/v1",
    )
  ) {
    return clean;
  }

  return `${clean}/api/v1`;
}

export async function POST(
  request: NextRequest,
) {
  const accessToken =
    request.cookies.get(
      "foodhub_access_token",
    )?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        status: 401,
        message:
          "Missing admin access token.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const incomingForm =
      await request.formData();

    const file =
      incomingForm.get(
        "file",
      );

    const purpose =
      String(
        incomingForm.get(
          "purpose",
        ) ??
          "CATALOG_FOOD_PRIMARY",
      ).trim();

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          status: 400,
          message:
            "Image file is required.",
        },
        {
          status: 400,
        },
      );
    }

    const backendForm =
      new FormData();

    backendForm.append(
      "file",
      file,
      file.name,
    );

    const backendUrl =
      new URL(
        `${getBackendApiBaseUrl()}/media`,
      );

    backendUrl.searchParams.set(
      "purpose",
      purpose,
    );

    const backendResponse =
      await fetch(
        backendUrl,
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },
          body:
            backendForm,
          cache:
            "no-store",
        },
      );

    const body =
      await backendResponse.arrayBuffer();

    const contentType =
      backendResponse.headers.get(
        "content-type",
      ) ??
      "application/json";

    if (
      !backendResponse.ok
    ) {
      console.error(
        "[MEDIA UPLOAD ERROR]",
        {
          status:
            backendResponse.status,
          purpose,
          response:
            new TextDecoder().decode(
              body,
            ),
        },
      );
    }

    return new NextResponse(
      body.byteLength
        ? body
        : null,
      {
        status:
          backendResponse.status,
        headers: {
          "Content-Type":
            contentType,
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "[MEDIA UPLOAD CONNECTION ERROR]",
      error,
    );

    return NextResponse.json(
      {
        status: 502,
        message:
          "Could not upload media.",
      },
      {
        status: 502,
      },
    );
  }
}
