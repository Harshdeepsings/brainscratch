import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloseIcon } from "./icons/CloseIcon";
import { EyeIcon, EyeOffIcon } from "./icons/EyeIcon";
import { Button } from "./ui/Button";
import axios from "axios";
import { BACKEND_URI } from "../config";

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    onLogout: () => void;
    onDeleteAccount: () => void;
    initialProfile?: { username: string; email: string; avatar: string } | null;
    onProfileUpdated?: (profile: { username: string; email: string; avatar: string }) => void;
}

export function ProfileModal({
    open,
    onClose,
    onLogout,
    onDeleteAccount,
    initialProfile,
    onProfileUpdated
}: ProfileModalProps) {
    const [username, setUsername] = useState(initialProfile?.username || "");
    const [email, setEmail] = useState(initialProfile?.email || "");
    const [avatar, setAvatar] = useState(initialProfile?.avatar || "");
    const [prevProfile, setPrevProfile] = useState(initialProfile);

    if (initialProfile !== prevProfile) {
        setPrevProfile(initialProfile);
        setUsername(initialProfile?.username || "");
        setEmail(initialProfile?.email || "");
        setAvatar(initialProfile?.avatar || "");
    }

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password change states
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPass, setShowNewPass] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!newPassword || newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        setPasswordSaving(true);
        try {
            const res = await axios.put<{ message: string }>(
                `${BACKEND_URI}/api/v1/user/change-password`,
                {
                    newPassword
                },
                { headers: { Authorization: token } }
            );

            setPasswordSuccess(res.data.message || "Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                setPasswordSuccess(null);
                setShowPasswordSection(false);
            }, 2500);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message
                : "Failed to update password. Please try again.";
            setPasswordError(msg);
        } finally {
            setPasswordSaving(false);
        }
    };

    const defaultInitial = (username.trim()[0] || "U").toUpperCase();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file (PNG, JPG, WebP)");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Image size exceeds 2MB limit. Please choose a smaller photo.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setAvatar(result);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        setSaving(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await axios.put<{
                message: string;
                user: { username: string; email: string; avatar: string };
            }>(
                `${BACKEND_URI}/api/v1/user/profile`,
                {
                    username: username.trim(),
                    email: email.trim(),
                    avatar
                },
                { headers: { Authorization: token } }
            );

            setSuccessMsg("Profile updated successfully!");
            onProfileUpdated?.(res.data.user);
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message
                : "Failed to update profile";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-slate-700/80">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                Your Profile
                            </h2>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                                Account
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                            aria-label="Close modal"
                        >
                            <CloseIcon size="md" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                        <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 p-3.5 sm:p-4 rounded-xl bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200/80 dark:border-slate-700/60">
                                {/* Avatar Display */}
                                <div className="relative shrink-0">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={username || "User"}
                                            className="size-16 sm:size-20 rounded-full object-cover border-2 border-purple-500 shadow-sm"
                                        />
                                    ) : (
                                        <div className="size-16 sm:size-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md select-none border-2 border-white dark:border-slate-800">
                                            {defaultInitial}
                                        </div>
                                    )}
                                </div>

                                {/* Avatar Controls */}
                                <div className="flex-1 text-center sm:text-left space-y-1.5 sm:space-y-2">
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                        Profile Picture
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                        {avatar
                                            ? "Custom profile photo active."
                                            : `Defaulting to the first letter (${defaultInitial}) of your username.`}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                        >
                                            Upload Photo
                                        </button>

                                        {avatar && (
                                            <button
                                                type="button"
                                                onClick={() => setAvatar("")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                                            >
                                                Use Default Letter ({defaultInitial})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Username & Email Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                    <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 block">
                                        3 to 30 characters (letters, numbers, underscores).
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                    <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 block">
                                        Used for account recovery and sign-in.
                                    </span>
                                </div>
                            </div>

                            {/* Change Password Section */}
                            <div className="rounded-xl border border-gray-200/80 dark:border-slate-700/80 overflow-hidden bg-gray-50/50 dark:bg-slate-900/40">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordSection(!showPasswordSection);
                                        setPasswordError(null);
                                        setPasswordSuccess(null);
                                    }}
                                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-100/60 dark:hover:bg-slate-900/80 transition-colors text-left cursor-pointer"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
                                            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white block">
                                                Change Password
                                            </span>
                                            <span className="text-[11px] text-gray-500 dark:text-slate-400">
                                                Update your account password
                                            </span>
                                        </div>
                                    </div>
                                    <svg
                                        className={`size-4 text-gray-400 transition-transform ${showPasswordSection ? "rotate-180" : ""}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" strokeWidth={2} />
                                    </svg>
                                </button>

                                {showPasswordSection && (
                                    <div className="p-4 space-y-3.5 bg-white dark:bg-slate-800/90 border-t border-gray-200/80 dark:border-slate-700/60">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                                New Password (min 8 characters)
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type={showNewPass ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="w-full text-xs px-3 py-2 pr-9 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPass(!showNewPass)}
                                                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
                                                >
                                                    {showNewPass ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type={showNewPass ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        {passwordError && (
                                            <p className="text-[11px] text-red-500 font-medium">
                                                {passwordError}
                                            </p>
                                        )}

                                        {passwordSuccess && (
                                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                                <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                                <span>{passwordSuccess}</span>
                                            </p>
                                        )}

                                        <div className="flex justify-end pt-1">
                                            <button
                                                type="button"
                                                onClick={handlePasswordChange}
                                                disabled={passwordSaving}
                                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
                                            >
                                                {passwordSaving ? "Updating Password..." : "Update Password"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Alerts */}
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            {successMsg && (
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                    <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            {/* Save & Logout Actions */}
                            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer"
                                >
                                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                    </svg>
                                    <span>Log Out</span>
                                </button>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <Button
                                        type="button"
                                        onClick={onClose}
                                        variant="secondary"
                                        size="md"
                                        text="Cancel"
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="md"
                                        loading={saving}
                                        text={saving ? "Saving..." : "Save Changes"}
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Delete Account */}
                        <div className="pt-4 sm:pt-5 border-t border-gray-100 dark:border-slate-700/80">
                            <div className="p-3.5 sm:p-4 rounded-xl border border-red-200/80 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-xs font-bold text-red-600 dark:text-red-400">
                                        Delete Account
                                    </h4>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                                        Permanently erase your account, bookmarks, videos, and shared brain.
                                    </p>
                                </div>

                                {!confirmDelete ? (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete(true)}
                                        className="w-full sm:w-auto text-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shrink-0"
                                    >
                                        Delete Account
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete(false)}
                                            className="px-2.5 py-1 text-xs text-gray-600 dark:text-slate-300 hover:underline cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onDeleteAccount}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-700 hover:bg-red-800 transition-colors cursor-pointer"
                                        >
                                            Confirm Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
