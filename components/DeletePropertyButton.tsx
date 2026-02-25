"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function DeletePropertyButton({ propertyId, propertyName }: { propertyId: string, propertyName: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${propertyName}"? This cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase
            .from("properties")
            .delete()
            .eq("id", propertyId);

        setIsDeleting(false);

        if (error) {
            alert(`Failed to delete property: ${error.message}`);
        } else {
            router.refresh();
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
        >
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    );
}
