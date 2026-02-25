import CustomLink from "@/components/CustomLink";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function OwnerDashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownerId = user?.id;

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  const hasProperties = properties && properties.length > 0;

  return (
    <div className="min-h-[70vh] w-full max-w-7xl mx-auto px-6 py-12">
      {/* 1️⃣ Top Section */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Your Properties
        </h1>

        <CustomLink
          href="/dashboard/owner/new"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg whitespace-nowrap"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          List New Property
        </CustomLink>
      </div>

      {/* 2️⃣ Below Heading */}
      {!hasProperties ? (
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-16 text-center">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            You haven’t listed any properties yet.
          </h2>

          <CustomLink
            href="/dashboard/owner/new"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            List New Property
          </CustomLink>
        </div>
      ) : (
        <>
          {/* SINGLE ROW — max 3 cards */}
          <div className="flex gap-6 overflow-x-auto pb-2">
            {properties.slice(0, 3).map((property) => (
              <div
                key={property.id}
                className="min-w-[340px] max-w-[360px] flex-shrink-0 group overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md dark:bg-gray-950 dark:border-gray-800"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <img
                    src={property.thumbnail_url}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
                      {property.title}
                    </h3>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      ₹{property.price_per_month?.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {property.city}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      ID: {property.id.split("-")[0]}
                    </span>

                    <div className="flex items-center gap-2">
                      <CustomLink
                        href={`/dashboard/owner/${property.id}/edit`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Edit
                      </CustomLink>

                      <span className="text-gray-300">•</span>

                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3️⃣ Footer Link */}
          <div className="mt-8 flex justify-end">
            <CustomLink
              href="/dashboard/owner/properties"
              className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              Show All Properties →
            </CustomLink>
          </div>
        </>
      )}
    </div>
  );
}