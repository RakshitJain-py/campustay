import CustomLink from "@/components/CustomLink";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";


export default async function OwnerPropertiesPage() {
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

    const { data: { user } } = await supabase.auth.getUser();

    const { data: properties } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

    const hasProperties = properties && properties.length > 0;

    return (
        <div className="min-h-[70vh] w-full max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <CustomLink
                        href="/dashboard"
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                        ← Back to Dashboard
                    </CustomLink>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-2">
                        All Properties
                    </h1>
                </div>
                <CustomLink
                    href="/dashboard/owner/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-violet-500 dark:to-indigo-500"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    List New Property
                </CustomLink>
            </div>

            {!hasProperties ? (
                <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-16 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No properties listed yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <div
                            key={property.id}
                            className="group overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md dark:bg-gray-950 dark:border-gray-800"
                        >
                            <CustomLink href={`/property/${property.id}`} className="block relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={property.thumbnail_url}
                                    alt={property.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </CustomLink>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <CustomLink href={`/property/${property.id}`} className="hover:text-violet-600 transition-colors">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
                                            {property.title}
                                        </h3>
                                    </CustomLink>
                                    <span className="font-bold text-violet-600 dark:text-violet-400">
                                        ₹{property.price_per_month.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {property.city}
                                </p>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-end gap-3">
                                    <CustomLink
                                        href={`/dashboard/owner/${property.id}/edit`}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        Edit
                                    </CustomLink>
                                    <span className="text-gray-300">•</span>
                                    <DeletePropertyButton propertyId={property.id} propertyName={property.title} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
