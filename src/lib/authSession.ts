let accessToken: string | null = null;
let refreshHandler: (() => Promise<boolean>) | null = null;

export function setAuthAccessToken(token: string | null) {
  accessToken = token;
}

export function getAuthAccessToken() {
  return accessToken;
}

export function setAuthRefreshHandler(handler: (() => Promise<boolean>) | null) {
  refreshHandler = handler;
}

export async function refreshAuthAccessToken() {
  return refreshHandler ? refreshHandler() : false;
}

export function clearAuthSession() {
  accessToken = null;
  refreshHandler = null;
}
