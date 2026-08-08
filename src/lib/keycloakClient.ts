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

export function initKeycloak() {
  if (!initPromise) {
    const client = getKeycloakClient();

    client.onAuthRefreshSuccess = () => {
      setAuthAccessToken(client.token ?? null);
    };

    client.onAuthLogout = () => {
      clearAuthSession();
    };

    initPromise = client
      .init({
        onLoad: "login-required",
        flow: "standard",
        pkceMethod: "S256",
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        setAuthAccessToken(client.token ?? null);
        setAuthRefreshHandler(refreshKeycloakToken);
        return authenticated;
      });
  }

  return initPromise;
}

export async function refreshKeycloakToken() {
  const client = getKeycloakClient();

  if (!client.authenticated) {
    return false;
  }

  try {
    await client.updateToken(30);
    setAuthAccessToken(client.token ?? null);
    return Boolean(client.token);
  } catch {
    clearAuthSession();
    await client.login();
    return false;
  }
}

export async function logoutKeycloak() {
  clearAuthSession();
  await getKeycloakClient().logout({
    redirectUri: window.location.origin,
  });
}
