import { NextRequest, NextResponse } from "next/server";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  forwardMediaToBackend,
  isStoreMediaPurpose,
} from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
): Promise<Response> {
  const accessToken =
    request.cookies.get("foodhub_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        message: "Admin session is missing or expired.",
      },
      {
        status: 401,
      },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        message: "Invalid multipart form data.",
      },
      {
        status: 400,
      },
    );
  }

  const file = formData.get("file");
  const purpose = formData.get("purpose");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        message: "Image file is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!isStoreMediaPurpose(purpose)) {
    return NextResponse.json(
      {
        message:
          "purpose must be STORE_LOGO or STORE_COVER.",
      },
      {
        status: 400,
      },
    );
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        message:
          "Only PNG, JPEG, GIF and WebP images are supported.",
      },
      {
        status: 415,
      },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json(
      {
        message: "The selected image is empty.",
      },
      {
        status: 400,
      },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        message: "Image must be 10 MB or smaller.",
      },
      {
        status: 413,
      },
    );
  }

  return forwardMediaToBackend({
    accessToken,
    file,
    purpose,
  });
}
