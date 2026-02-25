export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileManager from "@/components/ProfileManager";

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
        .select("role, avatar_url")
        .eq("id", user.id)
        .single();

    if (error || !profile) {
        redirect("/login?error=auth");
    }

    let details = null;
    if (profile.role === "student") {
        const { data } = await supabase.from("students").select("name, phone").eq("id", user.id).single();
        details = data;
    } else if (profile.role === "guardian") {
        const { data } = await supabase.from("guardians").select("name, phone").eq("id", user.id).single();
        details = data;
    }

    return (
        <div className="min-h-[70vh] w-full max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-8 text-foreground">
                Profile Settings
            </h1>

            <ProfileManager
                user={{ id: user.id, email: user.email || "" }}
                profile={{ role: profile.role, avatar_url: profile.avatar_url }}
                details={details}
            />
        </div>
    );
}