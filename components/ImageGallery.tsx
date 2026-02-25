"use client";

import { useState } from "react";

interface ImageGalleryProps {
    thumbnailUrl: string;
    imageUrls: string[];
}

export default function ImageGallery({ thumbnailUrl, imageUrls }: ImageGalleryProps) {
    const images = [thumbnailUrl, ...imageUrls.filter(url => url !== thumbnailUrl)].slice(0, 5);
    const [showAll, setShowAll] = useState(false);

    if (showAll) {
        return (
            <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8 relative">
                    <button
                        onClick={() => setShowAll(false)}
                        className="sticky top-4 mb-4 flex items-center gap-2 rounded-full bg-muted/80 backdrop-blur-md px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to property
                    </button>
                    <div className="grid gap-6">
                        {images.map((img, i) => (
                            <img key={i} src={img} alt={`Property image ${i + 1}`} className="w-full rounded-xl border border-border" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className="w-full h-[400px] sm:h-[500px] overflow-hidden rounded-2xl border border-border bg-muted">
                <img src={images[0]} alt="Property" className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden border border-border">
            <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-2 h-full w-full">
                {/* Main image spanning half the grid */}
                <div className="col-span-2 row-span-2 relative bg-muted cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setShowAll(true)}>
                    <img src={images[0]} alt="Main property view" className="w-full h-full object-cover" />
                </div>

                {/* Secondary images */}
                {images.slice(1, 5).map((img, i) => (
                    <div key={i} className={`relative bg-muted cursor-pointer hover:opacity-95 transition-opacity ${i >= 2 ? 'hidden sm:block' : ''}`} onClick={() => setShowAll(true)}>
                        <img src={img} alt={`Property view ${i + 2}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>

            {images.length > 2 && (
                <button
                    onClick={() => setShowAll(true)}
                    className="absolute bottom-4 right-4 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur border border-white/20 dark:border-black/50 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-md hover:scale-105 transition-transform"
                >
                    Show all photos
                </button>
            )}
        </div>
    );
}
