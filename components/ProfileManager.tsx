"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface ProfileManagerProps {
    user: { id: string; email: string };
    profile: { role: string; avatar_url: string | null };
    details: any; // Additional details from students or guardians table
}

export default function ProfileManager({ user, profile, details }: ProfileManagerProps) {
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
    const [name, setName] = useState(details?.name || "");
    const [phone, setPhone] = useState(details?.phone || "");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage({ text: "Uploading avatar...", type: "info" });

        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicUrl } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            const url = publicUrl.publicUrl + "?t=" + new Date().getTime(); // cache bust

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: url })
                .eq("id", user.id);

            if (updateError) throw updateError;

            setAvatarUrl(url);
            setMessage({ text: "Avatar updated successfully!", type: "success" });
        } catch (err: any) {
            console.error(err);
            setMessage({ text: err.message || "Failed to upload avatar.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "Saving changes...", type: "info" });

        try {
            let table = "";
            if (profile.role === "student") table = "students";
            else if (profile.role === "guardian") table = "guardians";

            if (table) {
                const { error } = await supabase
                    .from(table)
                    .update({ name, phone })
                    .eq("id", user.id);

                if (error) throw error;
            }
            setMessage({ text: "Profile updated successfully!", type: "success" });
        } catch (err: any) {
            console.error(err);
            setMessage({ text: err.message || "Failed to update profile.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
            setLoading(true);
            setMessage({ text: "Processing deletion...", type: "info" });

            // In a real app we'd call an Edge Function to delete the auth user, because
            // client cannot delete users directly.
            // But for demo per plan, we will alert user that this requires admin.
            alert("Account deletion must be done by an administrator via Edge Function. (Not fully implemented on client)");
            setLoading(false);
            setMessage({ text: "", type: "" });
        }
    };

    return (
        <div className="space-y-8 bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background bg-muted">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-4xl text-foreground/40">
                                {user.email[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <label className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <svg className="w-8 h-8 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-xs font-semibold">Change</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
                    </label>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Personal Details</h2>
                    <p className="text-sm text-foreground/60 mt-1 capitalize">{profile.role} Account • {user.email}</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Editing Form */}
            {profile.role !== "hostel_owner" && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-foreground/80">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-foreground/80">Phone Number</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50 shadow-md shadow-violet-600/20"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}

            {/* Account Deletion */}
            <div className="pt-8 border-t border-border mt-8">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-foreground/60 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-6 py-3 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
}
