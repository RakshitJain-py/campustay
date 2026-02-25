"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoadingBarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start loading on path change
        setLoading(true);
        setProgress(30);

        const timer = setTimeout(() => {
            setProgress(70);
        }, 200);

        const endTimer = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 200);
        }, 400);

        return () => {
            clearTimeout(timer);
            clearTimeout(endTimer);
        };
    }, [pathname, searchParams]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] w-full bg-transparent">
            <div
                className="h-full bg-violet-600 transition-all duration-300 ease-out dark:bg-card"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

export default function LoadingBar() {
    return (
        <Suspense fallback={null}>
            <LoadingBarContent />
        </Suspense>
    );
}
