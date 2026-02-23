"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.contains("dark");

        if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }

        // Force a re-render to update the icon
        setMounted((prev) => !prev);
        setTimeout(() => setMounted((prev) => !prev), 0);
    };

    if (!mounted) {
        return <div className="h-8 w-14" aria-hidden="true" />;
    }

    const currentIsDark = typeof document !== 'undefined' ? document.documentElement.classList.contains("dark") : false;

    return (
        <button
            onClick={toggleTheme}
            className="relative flex h-8 w-14 items-center rounded-full bg-zinc-200 p-1 transition-colors duration-300 dark:bg-zinc-700"
            aria-label="Toggle dark mode"
        >
            <div
                className={`absolute h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center ${currentIsDark ? "translate-x-6" : "translate-x-0"
                    }`}
            >
                {currentIsDark ? (
                    <svg className="h-3.5 w-3.5 text-zinc-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                ) : (
                    <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.32a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.415l-.708-.707a1 1 0 010-1.415zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-3.1 4.22a1 1 0 010 1.415l-.707.708a1 1 0 11-1.415-1.414l.707-.708a1 1 0 011.415 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-4.22-2.32a1 1 0 01-1.415 0l-.708-.707a1 1 0 011.414-1.415l.708.707a1 1 0 010 1.415zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm3.1-4.22a1 1 0 010-1.415l.707-.708a1 1 0 111.415 1.414l-.707.708a1 1 0 01-1.415 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
        </button>
    );
}
