"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { CurrentAdmin } from "@/src/types/currentAdmin";
import { redirectToAdminLogin } from "@/src/lib/redirectToAdminLogin";
import { normalizePayload } from "@/src/utils/normalize";

interface UseCurrentAdminResult {
  admin: CurrentAdmin | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function normalizeCurrentAdmin(response: unknown): CurrentAdmin {
  const raw = normalizePayload<unknown>(response, response);

  if (
    raw &&
    typeof raw === "object" &&
    "user" in raw &&
    (raw as { user?: unknown }).user
  ) {
    return normalizePayload<CurrentAdmin>(
      (raw as { user: unknown }).user,
      (raw as { user: CurrentAdmin }).user,
    );
  }

  return raw as CurrentAdmin;
}

const ADMIN_CACHE_KEY = "foodhub_current_admin_cache";

export function useCurrentAdmin(): UseCurrentAdminResult {
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem(ADMIN_CACHE_KEY);
      if (cached) {
        setAdmin(JSON.parse(cached));
      }
    } catch {}
  }, []);

  const loadCurrentAdmin = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        let errorMsg = `Could not load current admin (${response.status}).`;
        try {
          const errBody = await response.json();
          if (errBody?.message) {
            errorMsg = errBody.message;
          }
        } catch {
          // Response was not JSON
        }

        if (response.status === 401) {
          if (typeof window !== "undefined") {
            try {
              window.sessionStorage.removeItem(ADMIN_CACHE_KEY);
            } catch {}
          }
          setAdmin(null);
          redirectToAdminLogin();
          setError("Admin session has expired.");
          return;
        }

        if (response.status === 403) {
          setError("This account does not have permission.");
          return;
        }

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          console.warn(`[CURRENT ADMIN] Backend unavailable (${response.status}): ${errorMsg}`);
          setError(`FoodHub backend is currently unreachable (${response.status}).`);
          return;
        }

        setError(errorMsg);
        return;
      }

      const data = normalizeCurrentAdmin(await response.json());
      setAdmin(data);

      if (typeof window !== "undefined" && data) {
        try {
          window.sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.warn("[CURRENT ADMIN NETWORK ERROR]", err);
      setError(
        err instanceof Error ? err.message : "Could not load current admin.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentAdmin();
  }, [loadCurrentAdmin]);

  return {
    admin,
    isLoading,
    error,
    refetch: loadCurrentAdmin,
  };
}
