export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (error || !profile) {
        redirect("/login?error=auth");
    }

    return (
        <div className="min-h-[70vh] w-full max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-8">
                Profile Settings
            </h1>

            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email
                    </p>
                    <p className="text-lg font-medium">{user.email}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Role
                    </p>
                    <p className="text-lg font-medium capitalize">
                        {profile.role}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        User ID
                    </p>
                    <p className="text-sm font-mono break-all">
                        {user.id}
                    </p>
                </div>
            </div>
        </div>
    );
}