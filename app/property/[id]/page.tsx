import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import ShareButton from "@/components/ShareButton";
import ReviewSection from "@/components/ReviewSection";
import ScrollToTop from "@/components/ScrollToTop";

export default async function PropertyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

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

    const { data: property, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !property) {
        console.error("Property fetch error:", error);
        notFound();
    }

    const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("avatar_url, role")
        .eq("id", property.owner_id)
        .single();

    if (ownerProfile) {
        property.owner = ownerProfile;
    }

    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <div className="mx-auto max-w-5xl px-6 py-8">

                {/* Header Section */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-foreground">
                                {property.title}
                            </h1>
                            {property.is_verified && (
                                <div className="flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-500 pb-[2px]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold text-foreground">
                                    {property.rating_avg ? Number(property.rating_avg).toFixed(1) : "New"}
                                </span>
                                <span className="underline">({property.rating_count} reviews)</span>
                            </div>
                            <span className="text-border">•</span>
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {property.area}, {property.city}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ShareButton title={property.title} text={`Check out ${property.title} on CampuStay!`} />
                    </div>
                </div>

                {/* Image Gallery */}
                <ImageGallery
                    thumbnailUrl={property.thumbnail_url}
                    imageUrls={property.image_urls || []}
                />

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="flex items-center justify-between pb-6 border-b border-border">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Property Owner Info</h2>
                                <p className="text-sm text-foreground/60">Property Owner</p>
                            </div>
                            <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                                {property.owner?.avatar_url ? (
                                    <img src={property.owner.avatar_url} alt="Owner" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xl text-foreground/40 font-bold">
                                        O
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-4">About this property</h3>
                            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                {property.description || "No description provided."}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-foreground mb-4">What this place offers</h3>
                            {property.amenities && property.amenities.length > 0 ? (
                                <ul className="grid grid-cols-2 gap-4">
                                    {property.amenities.map((amenity: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3 text-foreground/80">
                                            <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {amenity}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-foreground/60 text-sm">Amenities not listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="md:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl w-full">
                            <div className="mb-4">
                                <span className="text-2xl font-bold text-foreground">₹{property.price_per_month.toLocaleString()}</span>
                                <span className="text-foreground/60 text-sm"> / month</span>
                            </div>

                            <div className="rounded-xl border border-border p-4 mb-6">
                                <div className="text-xs font-semibold uppercase text-foreground/60 mb-1">Location details</div>
                                <div className="text-sm text-foreground leading-snug">
                                    {property.address}
                                </div>
                                {property.college_nearby && (
                                    <div className="mt-3 text-sm text-foreground/80 pt-3 border-t border-border">
                                        <span className="font-semibold block mb-1">Nearby College</span>
                                        {property.college_nearby}
                                    </div>
                                )}
                            </div>

                            <button className="w-full rounded-xl bg-violet-600 py-3.5 text-center text-sm font-semibold text-white transition-all hover:bg-violet-700 active:scale-[0.98]">
                                Contact Host
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 pt-12 border-t border-border">
                    <ReviewSection
                        propertyId={property.id}
                        ownerId={property.owner_id}
                        currentUserId={user?.id}
                        initialRatingAvg={property.rating_avg}
                        initialRatingCount={property.rating_count}
                    />
                </div>
            </div>
            <ScrollToTop />
        </div>
    );
}
