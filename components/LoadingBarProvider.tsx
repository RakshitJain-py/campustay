"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingContextType {
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
    startLoading: () => { },
    stopLoading: () => { },
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingBarProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Stop loading whenever the route actually changes
    useEffect(() => {
        stopLoading();
    }, [pathname, searchParams]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            setProgress(10); // initial bump
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + 5;
                });
            }, 300);
        } else {
            // Complete the progress before hiding
            if (progress > 0) {
                setProgress(100);
                setTimeout(() => setProgress(0), 300); // 300ms transition time
            }
        }

        return () => clearInterval(interval);
    }, [isLoading]);

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    return (
        <LoadingContext.Provider value={{ startLoading, stopLoading }}>
            {/* The progress bar UI */}
            {progress > 0 && (
                <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] w-full bg-transparent">
                    <div
                        className="h-full bg-violet-600 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            {children}
        </LoadingContext.Provider>
    );
}
