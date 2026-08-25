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

export function useCurrentAdmin(): UseCurrentAdminResult {
  const [admin, setAdmin] =
    useState<CurrentAdmin | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadCurrentAdmin =
    useCallback(async () => {
      try {
        setError(null);

        const response = await fetch(
          "/api/users/me",
          {
            method: "GET",

            headers: {
              Accept: "application/json",
            },

            credentials: "include",

            cache: "no-store",
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            redirectToAdminLogin();

            throw new Error(
              "Admin session has expired.",
            );
          }

          if (response.status === 403) {
            throw new Error(
              "This account does not have permission.",
            );
          }

          throw new Error(
            `Could not load current admin (${response.status}).`,
          );
        }

        const data = normalizeCurrentAdmin(await response.json());

        setAdmin(data);
      } catch (error) {
        console.error(
          "[CURRENT ADMIN ERROR]",
          error,
        );

        setAdmin(null);

        setError(
          error instanceof Error
            ? error.message
            : "Could not load current admin.",
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
