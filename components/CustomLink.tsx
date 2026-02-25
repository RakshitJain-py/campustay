"use client";

import { useRouterWithLoading } from "@/hooks/useRouterWithLoading";
import { ReactNode } from "react";

interface CustomLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    ariaLabel?: string;
}

export default function CustomLink({ href, children, className, onClick, ariaLabel }: CustomLinkProps) {
    const router = useRouterWithLoading();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onClick) onClick();
        router.push(href);
    };

    return (
        <a
            href={href}
            onClick={handleClick}
            className={className}
            aria-label={ariaLabel}
        >
            {children}
        </a>
    );
}
