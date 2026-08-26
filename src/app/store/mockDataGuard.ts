export const fileMockDataEnabled = process.env.NODE_ENV !== "production";

export function requireFileMockData(resourceName: string) {
  if (!fileMockDataEnabled) {
    throw new Error(
      `${resourceName} mock data is disabled in production mode.`,
    );
  }
}

export async function fetchFileMockJson<T>(
  path: string,
  resourceName: string,
): Promise<T> {
  requireFileMockData(resourceName);

  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load ${resourceName} mock data.`);
  }

  return (await res.json()) as T;
}

export function mockDataDisabledError(resourceName: string) {
  return {
    status: 403,
    data: `${resourceName} mock data is disabled in production mode.`,
  } as const;
}
