import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface KeycloakUser {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}

function clearAuthCookies(response: NextResponse) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("foodhub_access_token", "", options);
  response.cookies.set("foodhub_refresh_token", "", options);
  response.cookies.set("foodhub_id_token", "", options);
}

export async function GET(request: NextRequest) {
  const keycloakUrl =
    process.env.KEYCLOAK_URL ?? process.env.NEXT_PUBLIC_KEYCLOAK_URL;

  const realm =
    process.env.KEYCLOAK_REALM ?? process.env.NEXT_PUBLIC_KEYCLOAK_REALM;

  if (!keycloakUrl || !realm) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: "Keycloak configuration is missing",
      },
      { status: 500 },
    );
  }

  const accessToken = request.cookies.get("foodhub_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  let userInfoUrl: URL;

  try {
    userInfoUrl = new URL(
      `${keycloakUrl.trim().replace(/\/+$/, "")}` +
        `/realms/${encodeURIComponent(realm)}` +
        "/protocol/openid-connect/userinfo",
    );
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: "Keycloak configuration is invalid",
      },
      { status: 500 },
    );
  }

  try {
    const userResponse = await fetch(userInfoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!userResponse.ok) {
      const response = NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 },
      );

      clearAuthCookies(response);

      return response;
    }

    const user = (await userResponse.json()) as KeycloakUser;

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Failed to check authentication:", error);

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: "Unable to connect to Keycloak",
      },
      { status: 500 },
    );
  }
}
