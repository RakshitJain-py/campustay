import Pagination from "@/components/Pagination";
import ScrollToTop from "@/components/ScrollToTop";
import SearchControls from "@/components/SearchControls";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = (resolvedParams.q as string) || "";
  const sort = (resolvedParams.sort as string) || "created_at_desc";
  const minRating = resolvedParams.min_rating ? parseInt(resolvedParams.min_rating as string) : null;
  const minPrice = resolvedParams.min_price ? parseInt(resolvedParams.min_price as string) : null;
  const maxPrice = resolvedParams.max_price ? parseInt(resolvedParams.max_price as string) : null;
  const maxDistance = resolvedParams.max_distance ? parseFloat(resolvedParams.max_distance as string) : null;
  const verifiedOnly = resolvedParams.verified === "true";

  const pageParam = parseInt((resolvedParams.page as string) || "1");
  const LIMIT = 12;
  const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
  const pageOffset = (page - 1) * LIMIT;

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

  let collegeLat = null;
  let collegeLng = null;
  if (q) {
    const { data: college } = await supabase.from("colleges").select("lat, lng").ilike("name", q).maybeSingle();
    if (college) {
      collegeLat = college.lat;
      collegeLng = college.lng;
    }
  }

  const { data: properties } = await supabase.rpc("search_properties_near_college", {
    p_college_lat: collegeLat,
    p_college_lng: collegeLng,
    p_search_query: q,
    p_sort_by: sort,
    p_min_rating: minRating,
    p_min_price: minPrice,
    p_max_price: maxPrice,
    p_max_distance: maxDistance,
    p_verified_only: verifiedOnly,
    p_page_size: LIMIT,
    p_page_offset: pageOffset,
  });

  const hasResults = properties && properties.length > 0;
  const totalCount = Number(properties?.[0]?.total_count || 0);
  const totalPages = Math.ceil(totalCount / LIMIT);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          {q ? `Search: "${q}"` : "Search stays"}
        </h1>

        <SearchControls />

        {!q && !hasResults ? (
          <div className="rounded-2xl border border-border bg-muted p-12 text-center">
            <p className="text-sm text-foreground/60">Enter a college or area in the search bar above.</p>
          </div>
        ) : !hasResults ? (
          <div className="rounded-2xl border border-border bg-muted p-12 text-center">
            <p className="text-foreground/60">No stays found matching your criteria.</p>
            <Link
              href="/featured"
              className="mt-4 inline-block rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              View Featured Stays
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property: any) => (
                <div
                  key={property.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={property.thumbnail_url}
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {property.is_verified && (
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1 border border-white/20 dark:border-white/10 shadow-sm">
                        <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
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

                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.area}, {property.city}
                      </p>

                      {property.distance_km !== null && (
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-md">
                          {property.distance_km.toFixed(1)} km
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center text-sm font-medium text-yellow-500">
                        <svg className="w-4 h-4 mr-1 pb-[1px]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {property.rating_avg ? property.rating_avg.toFixed(1) : "New"}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({property.rating_count} reviews)
                      </span>
                    </div>

                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-semibold uppercase tracking-wider text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded">
                            +{property.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/property/${property.id}`}
                      className="block w-full rounded-xl bg-gray-50 dark:bg-gray-900 py-2.5 text-center text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination totalPages={totalPages} />
            )}
          </>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
}
