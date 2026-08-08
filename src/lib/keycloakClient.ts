"use client";

import Keycloak from "keycloak-js";

import {
  clearAuthSession,
  setAuthAccessToken,
  setAuthRefreshHandler,
} from "./authSession";

let keycloak: Keycloak | null = null;
let initPromise: Promise<boolean> | null = null;

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name} is required for Keycloak login.`);
  }

  return value;
}

export function getKeycloakClient() {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: requireEnv(
        "NEXT_PUBLIC_KEYCLOAK_URL",
        process.env.NEXT_PUBLIC_KEYCLOAK_URL,
      ),
      realm: requireEnv(
        "NEXT_PUBLIC_KEYCLOAK_REALM",
        process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
      ),
      clientId: requireEnv(
        "NEXT_PUBLIC_KEYCLOAK_CLIENT_ID",
        process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      ),
    });
  }

  return keycloak;
}

export function initKeycloak(): Promise<boolean> {
  if (!initPromise) {
    const client = getKeycloakClient();

    client.onAuthSuccess = () => {
      setAuthAccessToken(client.token ?? null);
    };

    client.onAuthRefreshSuccess = () => {
      setAuthAccessToken(client.token ?? null);
    };

    client.onAuthLogout = () => {
      clearAuthSession();
    };

    client.onAuthError = () => {
      clearAuthSession();
    };

    client.onTokenExpired = async () => {
      try {
        await refreshKeycloakToken();
      } catch (error) {
        console.error("[KEYCLOAK TOKEN REFRESH ERROR]", error);
      }
    };

    setAuthRefreshHandler(refreshKeycloakToken);

    initPromise = client
      .init({
        onLoad: "login-required",
        flow: "standard",
        pkceMethod: "S256",
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        if (authenticated && client.token) {
          setAuthAccessToken(client.token);
        } else {
          clearAuthSession();
        }

        console.log("[KEYCLOAK INIT]", {
          authenticated,
          hasToken: Boolean(client.token),
          tokenParsed: client.tokenParsed,
        });

        return authenticated;
      })
      .catch((error) => {
        console.error("[KEYCLOAK INIT ERROR]", error);

        clearAuthSession();
        initPromise = null;

        throw error;
      });
  }

  return initPromise;
}

export async function refreshKeycloakToken(): Promise<boolean> {
  const client = getKeycloakClient();

  if (!client.authenticated) {
    clearAuthSession();
    return false;
  }

  try {
    await client.updateToken(30);

    if (!client.token) {
      clearAuthSession();
      return false;
    }

    setAuthAccessToken(client.token);

    return true;
  } catch (error) {
    console.error("[KEYCLOAK REFRESH ERROR]", error);

    clearAuthSession();

    await client.login();

    return false;
  }
}

export async function logoutKeycloak() {
  const client = getKeycloakClient();

  clearAuthSession();

  await client.logout({
    redirectUri: window.location.origin,
  });
}