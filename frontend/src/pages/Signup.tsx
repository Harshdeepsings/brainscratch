import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogoIcon } from "../components/icons/LogoIcon";
import { EyeIcon, EyeOffIcon } from "../components/icons/EyeIcon";
import { Button } from "../components/ui/Button";
import axios from "axios";
import { BACKEND_URI } from "../config";

interface GoogleCredentialResponse {
    credential?: string;
}

interface GoogleAccounts {
    id: {
        initialize: (options: { client_id: string; callback: (res: GoogleCredentialResponse) => void }) => void;
        renderButton: (element: HTMLElement | null, options: Record<string, unknown>) => void;
    };
}

declare global {
    interface Window {
        google?: {
            accounts: GoogleAccounts;
        };
    }
}

interface FieldErrors {
    username?: string;
    email?: string;
    password?: string;
    code?: string;
}

export const Signup = () => {
    const [step, setStep] = useState<"form" | "verify">("form");
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [devCode, setDevCode] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(0);
    const isSubmittingRef = useRef<boolean>(false);

    const navigate = useNavigate();

    const handleGoogleResponse = useCallback(async (response: GoogleCredentialResponse) => {
        if (!response.credential) return;
        setError(null);
        setFieldErrors({});
        setLoading(true);
        try {
            const res = await axios.post<{ token: string }>(`${BACKEND_URI}/api/v1/user/google`, {
                credential: response.credential
            });
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (e: unknown) {
            const msg = axios.isAxiosError(e) && e.response?.data?.message
                ? e.response.data.message
                : "Google sign-up failed";
            setError(msg);
        } finally {
            isSubmittingRef.current = false;
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        document.title = "Create Your Second Brain — Brainscratch";
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId || step !== "form") return;

        const renderGoogleButton = () => {
            window.google?.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleResponse
            });
            const btnEl = document.getElementById("google-signup-btn");
            if (btnEl) {
                window.google?.accounts.id.renderButton(
                    btnEl,
                    {
                        type: "standard",
                        theme: document.documentElement.classList.contains("dark") ? "filled_black" : "outline",
                        size: "large",
                        width: 320,
                        text: "signin_with"
                    }
                );
            }
        };

        if (window.google?.accounts?.id) {
            renderGoogleButton();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = renderGoogleButton;
        document.head.appendChild(script);
        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [handleGoogleResponse, step]);

    // Send time-restricted 6-digit code to email
    async function handleSendVerificationCode() {
        if (loading || isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setError(null);
        const errors: FieldErrors = {};

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        // Client-side validations
        if (!trimmedUsername) {
            errors.username = "Username is required";
        } else if (trimmedUsername.length < 3) {
            errors.username = "Username must be at least 3 characters";
        } else if (trimmedUsername.length > 30) {
            errors.username = "Username must be at most 30 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
            errors.username = "Only letters, numbers, and underscores allowed";
        }

        if (!trimmedEmail) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            errors.email = "Please enter a valid email address";
        }

        if (!password) {
            errors.password = "Password is required";
        } else if (password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            isSubmittingRef.current = false;
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            const res = await axios.post<{ message: string; devCode?: string }>(
                `${BACKEND_URI}/api/v1/user/send-code`,
                {
                    email: trimmedEmail,
                    username: trimmedUsername
                }
            );

            if (res.data.devCode) {
                setDevCode(res.data.devCode);
                setCode(res.data.devCode);
            }

            setStep("verify");
            setCountdown(60);

            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response) {
                const responseData = e.response.data as {
                    message?: string;
                };

                const msg = responseData.message || "Failed to send verification code";
                if (e.response.status === 409) {
                    if (msg.toLowerCase().includes("username")) {
                        setFieldErrors({ username: "Username is already taken" });
                    } else {
                        setFieldErrors({ email: "An account with this email already exists" });
                    }
                } else {
                    setError(msg);
                }
            } else {
                setError("Failed to send verification code. Please check your network.");
            }
        } finally {
            isSubmittingRef.current = false;
            setLoading(false);
        }
    }

    // Submit verification code & register user
    async function handleVerifyAndSignup() {
        if (loading || isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setError(null);
        const trimmedCode = code.trim();

        if (!trimmedCode || trimmedCode.length !== 6) {
            setFieldErrors({ code: "Please enter the 6-digit verification code" });
            isSubmittingRef.current = false;
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            await axios.post(`${BACKEND_URI}/api/v1/user/signup`, {
                username: username.trim(),
                password,
                email: email.trim().toLowerCase(),
                code: trimmedCode
            });

            navigate("/signin", {
                state: { message: "Account created and email verified! Please sign in." }
            });
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response) {
                const responseData = e.response.data as { message?: string };
                setError(responseData.message || "Verification failed. Code may have expired.");
            } else {
                setError("Failed to verify account. Please try again.");
            }
        } finally {
            isSubmittingRef.current = false;
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-center items-center px-3 sm:px-4 py-8 sm:py-12 transition-colors">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-800 p-5 sm:p-8">
                {/* Brand Logo & Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-purple-600 dark:text-purple-400">
                            <LogoIcon size="lg" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Brainscratch
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center">
                        {step === "form"
                            ? "Save videos, tweets, and notes in your second brain"
                            : "Enter the time-restricted verification code"}
                    </p>
                </div>

                {step === "form" ? (
                    <>
                        {/* Google OAuth signup */}
                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                            <div className="mb-6">
                                <div id="google-signup-btn" className="flex justify-center w-full min-h-[44px]"></div>
                            </div>
                        )}

                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                                <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">OR</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendVerificationCode();
                            }}
                            noValidate
                            className="space-y-3.5"
                        >
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                    Username
                                </label>
                                <input
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (fieldErrors.username) {
                                            setFieldErrors((prev) => ({ ...prev, username: undefined }));
                                        }
                                    }}
                                    placeholder="Pick a username"
                                    type="text"
                                    autoComplete="username"
                                    className={`w-full text-sm px-3.5 py-2.5 border rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                                        fieldErrors.username
                                            ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-slate-700 focus:ring-purple-500"
                                    }`}
                                />
                                {fieldErrors.username && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                                        {fieldErrors.username}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                    Email
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (fieldErrors.email) {
                                            setFieldErrors((prev) => ({ ...prev, email: undefined }));
                                        }
                                    }}
                                    placeholder="name@example.com"
                                    type="email"
                                    autoComplete="email"
                                    className={`w-full text-sm px-3.5 py-2.5 border rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                                        fieldErrors.email
                                            ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                                            : "border-gray-300 dark:border-slate-700 focus:ring-purple-500"
                                    }`}
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                    Password
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (fieldErrors.password) {
                                                setFieldErrors((prev) => ({ ...prev, password: undefined }));
                                            }
                                        }}
                                        placeholder="At least 8 characters"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        className={`w-full text-sm px-3.5 py-2.5 pr-10 border rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                                            fieldErrors.password
                                                ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                                                : "border-gray-300 dark:border-slate-700 focus:ring-purple-500"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 border-0 bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded focus:outline-none focus:ring-0 transition-colors flex items-center justify-center cursor-pointer"
                                        title={showPassword ? "Hide password" : "Show password"}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                                        {fieldErrors.password}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                                    <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    variant="primary"
                                    size="lg"
                                    text={loading ? "Sending Code..." : "Continue to Verification"}
                                />
                            </div>
                        </form>
                    </>
                ) : (
                    /* Step 2: Verification Code Input */
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleVerifyAndSignup();
                        }}
                        noValidate
                        className="space-y-4"
                    >
                        <div className="p-3 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-center">
                            <p className="text-xs text-gray-700 dark:text-slate-300">
                                We sent a 6-digit verification code to:
                            </p>
                            <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mt-0.5 truncate">
                                {email}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                                Code expires in <strong>10 minutes</strong>.
                            </p>
                        </div>

                        {devCode && (
                            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                                <span>Dev Code: <strong className="font-mono text-sm tracking-wider">{devCode}</strong></span>
                                <span className="text-[10px] uppercase font-semibold text-amber-600">Auto-filled</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 text-center">
                                6-Digit Email Verification Code
                            </label>
                            <input
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.replace(/\D/g, ""));
                                    if (fieldErrors.code) {
                                        setFieldErrors((prev) => ({ ...prev, code: undefined }));
                                    }
                                }}
                                maxLength={6}
                                placeholder="123456"
                                type="text"
                                autoFocus
                                className={`w-full text-center tracking-widest font-mono text-xl px-3.5 py-2.5 border rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 transition-colors ${
                                    fieldErrors.code
                                        ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 dark:border-slate-700 focus:ring-purple-500"
                                }`}
                            />
                            {fieldErrors.code && (
                                <p className="text-xs text-red-500 dark:text-red-400 mt-1 text-center font-medium">
                                    {fieldErrors.code}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                                <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                            </div>
                        )}

                        <div className="pt-2 space-y-2">
                            <Button
                                type="submit"
                                loading={loading}
                                variant="primary"
                                size="lg"
                                text={loading ? "Verifying..." : "Verify & Create Account"}
                            />

                            <div className="flex items-center justify-between text-xs pt-2">
                                <button
                                    type="button"
                                    disabled={countdown > 0 || loading}
                                    onClick={() => handleSendVerificationCode()}
                                    className="text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50 cursor-pointer font-medium"
                                >
                                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("form");
                                        setError(null);
                                    }}
                                    className="text-gray-500 dark:text-slate-400 hover:underline cursor-pointer"
                                >
                                    Back to details
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-6">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
