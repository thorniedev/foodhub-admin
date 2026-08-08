"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, RefreshCcw } from "lucide-react";

import { initKeycloak, refreshKeycloakToken } from "../../lib/keycloakClient";

type AuthStatus = "loading" | "ready" | "error";

export default function KeycloakAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    initKeycloak()
      .then((authenticated) => {
        if (cancelled) {
          return;
        }

        if (!authenticated) {
          setStatus("error");
          setErrorMessage("Login was not completed.");
          return;
        }

        refreshInterval = setInterval(() => {
          void refreshKeycloakToken();
        }, 30_000);

        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not connect to Keycloak.",
        );
      });

    return () => {
      cancelled = true;

      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  if (status === "ready") {
    return <>{children}</>;
  }

  if (status === "error") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold text-gray-800">
            មិនអាចចូលប្រើ dashboard បានទេ
          </h1>
          <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#136C34] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f592b]"
          >
            <RefreshCcw size={16} />
            សាកល្បងម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">
        <LoaderCircle size={30} className="mx-auto animate-spin text-[#136C34]" />
        <p className="mt-3 text-sm">កំពុងភ្ជាប់ទៅ Keycloak...</p>
      </div>
    </div>
  );
}
