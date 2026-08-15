import Link from "next/link";
import { redirect } from "next/navigation";

import { getSafeAuthReturnPath } from "@/src/lib/authRedirect";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    error_description?: string;
    returnTo?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error_description ?? params.error;
  const returnTo = getSafeAuthReturnPath(params.returnTo);

  if (!errorMessage) {
    const loginParams = new URLSearchParams({
      returnTo,
      prompt: "login",
    });

    redirect(`/api/auth/login?${loginParams.toString()}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#136C34]">
            MhouBahar
          </p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            Admin dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in with your MhouBahar administrator account.
          </p>
        </div>

        {errorMessage && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <form action="/api/auth/login" method="get" className="mt-8">
          <input type="hidden" name="returnTo" value={returnTo} />
          {errorMessage && (
            <input type="hidden" name="prompt" value="login" />
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-[#136C34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f592b]"
          >
            {errorMessage ? "Try another account" : "Continue with Keycloak"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-4 block text-center text-xs text-gray-400 hover:text-gray-600"
        >
          MhouBahar Admin
        </Link>
      </section>
    </main>
  );
}
