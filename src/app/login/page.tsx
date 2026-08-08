import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    error_description?: string;
    loggedOut?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error_description ?? params.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#136C34]">
            FoodHub
          </p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            Admin dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in with your FoodHub administrator account.
          </p>
        </div>

        {params.loggedOut === "true" && (
          <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm text-[#136C34]">
            You have been logged out successfully.
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <form action="/api/auth/login" method="get" className="mt-8">
          <input type="hidden" name="returnTo" value="/" />
          <button
            type="submit"
            className="w-full rounded-xl bg-[#136C34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f592b]"
          >
            Continue with Keycloak
          </button>
        </form>

        <Link
          href="/"
          className="mt-4 block text-center text-xs text-gray-400 hover:text-gray-600"
        >
          FoodHub Admin
        </Link>
      </section>
    </main>
  );
}
