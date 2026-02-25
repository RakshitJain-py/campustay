"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/components/LoadingBarProvider";
import { useTransition } from "react";

export function useRouterWithLoading() {
    const router = useRouter();
    const { startLoading } = useLoading();
    const [isPending, startTransition] = useTransition();

    const push = (href: string, options?: any) => {
        if (window.location.pathname === href.split('?')[0] && window.location.search === (href.split('?')[1] ? `?${href.split('?')[1]}` : '')) {
            // Do nothing if navigating to exact same URL
            return router.push(href, options);
        }
        startLoading();
        startTransition(() => {
            router.push(href, options);
        });
    };

    const replace = (href: string, options?: any) => {
        if (window.location.pathname === href.split('?')[0] && window.location.search === (href.split('?')[1] ? `?${href.split('?')[1]}` : '')) {
            // Do nothing if navigating to exact same URL
            return router.replace(href, options);
        }
        startLoading();
        startTransition(() => {
            router.replace(href, options);
        });
    };

    return { ...router, push, replace, isPending };
}
