"use client";

import { useState } from "react";

export default function ShareButton({ title, text }: { title: string; text: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled or failed
                console.log("Share failed", err);
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l5.657 5.657m-5.657-5.657l5.657-5.657m0 0a3 3 0 115.368 5.368m-5.368-5.368C13.114 8.938 13 9.482 13 10c0 .482.114.938.316 1.342m0-2.684a3 3 0 115.368-5.368m-5.368 5.368a3 3 0 100 5.368" />
            </svg>
            {copied ? "Link Copied!" : "Share"}
        </button>
    );
}
