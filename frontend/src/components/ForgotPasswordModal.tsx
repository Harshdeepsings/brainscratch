import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloseIcon } from "./icons/CloseIcon";
import { EyeIcon, EyeOffIcon } from "./icons/EyeIcon";
import { Button } from "./ui/Button";
import axios from "axios";
import { BACKEND_URI } from "../config";

interface ForgotPasswordModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

export function ForgotPasswordModal({ open, onClose, onSuccess }: ForgotPasswordModalProps) {
    const [step, setStep] = useState<"request" | "reset">("request");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [devCode, setDevCode] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    const handleSendCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail) {
            setError("Email address is required.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await axios.post<{ message: string; devCode?: string }>(
                `${BACKEND_URI}/api/v1/user/forgot-password`,
                { email: trimmedEmail }
            );

            if (res.data.devCode) {
                setDevCode(res.data.devCode);
                setCode(res.data.devCode);
            }

            setStep("reset");
            setCountdown(60);

            // 60-second cooldown timer for resend
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message
                : "Failed to send reset code. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedCode = code.trim();

        if (!trimmedCode || trimmedCode.length !== 6) {
            setError("Please enter the 6-digit code sent to your email.");
            return;
        }

        if (!newPassword || newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await axios.post<{ message: string }>(
                `${BACKEND_URI}/api/v1/user/reset-password`,
                {
                    email: email.trim().toLowerCase(),
                    code: trimmedCode,
                    newPassword
                }
            );

            onSuccess(res.data.message || "Password reset successful! Please sign in with your new password.");
            handleClose();
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message
                : "Failed to reset password. Code may have expired.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep("request");
        setEmail("");
        setCode("");
        setNewPassword("");
        setError(null);
        setDevCode(null);
        onClose();
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl overflow-hidden my-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                                <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {step === "request" ? "Reset Password" : "Enter Verification Code"}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/60 cursor-pointer"
                        >
                            <CloseIcon size="md" />
                        </button>
                    </div>

                    {step === "request" ? (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                                Enter your verified email address. We will send you a <strong>time-restricted 6-digit code</strong> valid for 10 minutes to reset your password.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                    Registered Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your-email@example.com"
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-500 font-medium">
                                    {error}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    variant="secondary"
                                    size="md"
                                    text="Cancel"
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    loading={loading}
                                    text={loading ? "Sending Code..." : "Send Reset Code"}
                                />
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                                A 6-digit reset code was sent to <strong className="text-purple-600 dark:text-purple-400">{email}</strong>. Code expires in 10 minutes.
                            </p>

                            {devCode && (
                                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                                    <span>Dev Code: <strong className="font-mono text-sm tracking-wider">{devCode}</strong></span>
                                    <span className="text-[10px] uppercase font-semibold text-amber-600">Dev Mode</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                    6-Digit Verification Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={code}
                                    onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                                    placeholder="123456"
                                    className="w-full text-center tracking-widest font-mono text-lg px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                    New Password (min 8 characters)
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new secure password"
                                        className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs text-red-500 font-medium">
                                    {error}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    disabled={countdown > 0 || loading}
                                    onClick={() => handleSendCode()}
                                    className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 cursor-pointer"
                                >
                                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep("request")}
                                    className="text-xs text-gray-500 dark:text-slate-400 hover:underline cursor-pointer"
                                >
                                    Change email
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-700/60">
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    variant="secondary"
                                    size="md"
                                    text="Cancel"
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    loading={loading}
                                    text={loading ? "Resetting..." : "Reset Password"}
                                />
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
