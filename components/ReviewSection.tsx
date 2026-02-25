"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { permissions } from "@/lib/permissions";

interface ReviewSectionProps {
    propertyId: string;
    ownerId: string;
    currentUserId?: string;
    initialRatingAvg: number | null;
    initialRatingCount: number;
}

export default function ReviewSection({
    propertyId,
    ownerId,
    currentUserId,
    initialRatingAvg,
    initialRatingCount,
}: ReviewSectionProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refresh, setRefresh] = useState(0);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchReviews() {
            const { data } = await supabase
                .from("reviews")
                .select(`
          id, rating, comment, created_at, user_id,
          profiles:user_id (name, avatar_url),
          review_images (image_url)
        `)
                .eq("property_id", propertyId)
                .order("created_at", { ascending: false });

            if (data) setReviews(data);
            setLoading(false);
        }
        fetchReviews();
    }, [propertyId, supabase, refresh]);

    const canReview = permissions.canReviewProperty(currentUserId, ownerId);
    const hasReviewed = reviews.some((r) => r.user_id === currentUserId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId || !canReview || hasReviewed) return;

        setSubmitting(true);
        try {
            // Create Review first to get ID
            const newReviewId = crypto.randomUUID();

            const { error: reviewError } = await supabase.from("reviews").insert({
                id: newReviewId,
                property_id: propertyId,
                user_id: currentUserId,
                rating,
                comment,
            });

            if (reviewError) throw reviewError;

            // Handle Image Upload if any
            if (file) {
                const fileExt = file.name.split('.').pop();
                const filePath = `${currentUserId}/${newReviewId}/image.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("review-images")
                    .upload(filePath, file);

                if (!uploadError) {
                    const { data: publicUrl } = supabase.storage
                        .from("review-images")
                        .getPublicUrl(filePath);

                    await supabase.from("review_images").insert({
                        review_id: newReviewId,
                        image_url: publicUrl.publicUrl,
                    });
                }
            }

            setRefresh((p) => p + 1);
            setShowForm(false);
            setComment("");
            setFile(null);
            setRating(5);
        } catch (err) {
            console.error(err);
            alert("Failed to post review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="py-10 text-center animate-pulse text-foreground/50">Loading reviews...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-500 pb-[3px]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {reviews.length > 0
                        ? `${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} · ${reviews.length} reviews`
                        : "No reviews yet"}
                </h2>

                {canReview && !hasReviewed && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-xl border border-border px-4 py-2 font-medium text-foreground hover:bg-muted transition-colors"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="border border-border bg-muted/50 rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-700'}`}
                                >
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Comment (Optional)</label>
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                            placeholder="Share your experience..."
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground/80 mb-1">Add a Photo (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-foreground/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900/30 file:text-violet-700 dark:file:text-violet-400 hover:file:bg-violet-100 transition-colors"
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 font-medium text-foreground/80 hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                        >
                            {submitting ? "Posting..." : "Post Review"}
                        </button>
                    </div>
                </form>
            )}

            {currentUserId && hasReviewed && !showForm && (
                <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl p-4 text-sm text-violet-800 dark:text-violet-300">
                    You have already reviewed this property. Thanks for your feedback!
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {reviews.map((review) => (
                    <div key={review.id} className="border border-border rounded-2xl p-6 bg-card">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                                {review.profiles?.avatar_url ? (
                                    <img src={review.profiles.avatar_url} alt={review.profiles.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center font-bold text-foreground/40">
                                        {review.profiles?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-semibold text-foreground leading-tight">{review.profiles?.name || "Anonymous User"}</div>
                                <div className="text-xs text-foreground/50">{new Date(review.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex text-yellow-500 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'opacity-100' : 'opacity-20'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        {review.comment && (
                            <p className="text-sm text-foreground/80 leading-relaxed mb-4">{review.comment}</p>
                        )}
                        {review.review_images && review.review_images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto mt-3 pb-2">
                                {review.review_images.map((img: any, i: number) => (
                                    <img key={i} src={img.image_url} alt="Review attachment" className="h-24 w-auto rounded-lg border border-border object-cover" />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
