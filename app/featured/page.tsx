import Pagination from "@/components/Pagination";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import CustomLink from "@/components/CustomLink";

export default async function FeaturedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const city = (resolvedParams.city as string) || "Delhi";

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

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("city", city)
    .order("created_at", { ascending: false });

  const hasResults = properties && properties.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Showing stays in {city}
          </h1>
          <CustomLink
            href="/search"
            className="rounded-full border border-violet-600 px-6 py-2 text-sm font-semibold text-violet-600 transition-all duration-200 hover:bg-violet-600 hover:text-white dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-500 dark:hover:text-white text-center"
          >
            Fine Tune Your Search
          </CustomLink>
        </div>

        {!hasResults ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-950">
            <p className="text-gray-600 dark:text-gray-400">No stays found for {city} yet.</p>
            <CustomLink
              href="/"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-violet-500 dark:to-indigo-500"
            >
              Back to Home
            </CustomLink>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={property.thumbnail_url}
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
                        {property.title}
                      </h3>
                      <span className="font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap">
                        ₹{property.price_per_month.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                      <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.area}, {property.city}
                    </p>
                    <CustomLink
                      href={`/property/${property.id}`}
                      className="block w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-violet-500 dark:to-indigo-500"
                    >
                      View Details
                    </CustomLink>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
