export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
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

    if (error || !profile?.role) {
        redirect("/login?error=auth");
    }

    const role = profile.role;

    // Redirect to the actual dashboard sub-path based on role
    if (role === "hostel_owner") {
        redirect("/dashboard/owner");
    }

    if (role === "student") {
        redirect("/dashboard/student");
    }

    if (role === "guardian") {
        redirect("/dashboard/guardian");
    }

    // Default fallback
    redirect("/login?error=auth");
}