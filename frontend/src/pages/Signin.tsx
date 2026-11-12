import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogoIcon } from "../components/icons/LogoIcon";
import { EyeIcon, EyeOffIcon } from "../components/icons/EyeIcon";
import { Button } from "../components/ui/Button";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";
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
    identifier?: string;
    password?: string;
}

export const Signin = () => {
    const [identifier, setIdentifier] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const isSubmittingRef = useRef<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string | null>(location.state?.message || null);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

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
                : "Google sign-in failed";
            setError(msg);
        } finally {
            isSubmittingRef.current = false;
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) return;

        const renderGoogleButton = () => {
            window.google?.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleResponse
            });
            const btnEl = document.getElementById("google-signin-btn");
            if (btnEl) {
                window.google?.accounts.id.renderButton(
                    btnEl,
                    {
                        type: "standard",
                        theme: document.documentElement.classList.contains("dark") ? "filled_black" : "outline",
                        size: "large",
                        width: 320,
                        text: "continue_with"
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
    }, [handleGoogleResponse]);

    async function signin() {
        if (loading || isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setError(null);
        const trimmedIdentifier = identifier.trim();
        const errors: FieldErrors = {};

        if (!trimmedIdentifier) {
            errors.identifier = "Username or email is required";
        }

        if (!password) {
            errors.password = "Password is required";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            const response = await axios.post<{ token: string }>(`${BACKEND_URI}/api/v1/user/signin`, {
                identifier: trimmedIdentifier,
                password
            });
            const jwt = response.data.token;
            localStorage.setItem("token", jwt);
            navigate("/dashboard");
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response) {
                const data = e.response.data as { message?: string };
                const msg = data.message || "Invalid username or password";

                if (e.response.status === 400) {
                    if (!trimmedIdentifier) {
                        setFieldErrors((prev) => ({ ...prev, identifier: "Username or email is required" }));
                    }
                    if (!password) {
                        setFieldErrors((prev) => ({ ...prev, password: "Password is required" }));
                    }
                    setError(msg);
                } else if (e.response.status === 401) {
                    if (msg.toLowerCase().includes("email") && !msg.toLowerCase().includes("username")) {
                        setFieldErrors({ identifier: msg });
                    } else {
                        setFieldErrors({
                            identifier: "Check your username or email",
                            password: "Check your password"
                        });
                        setError(msg);
                    }
                } else if (e.response.status === 403) {
                    setFieldErrors({ identifier: msg });
                    setError(msg);
                } else if (e.response.status === 429) {
                    setError("Too many authentication attempts. Please try again later.");
                } else {
                    setError(msg);
                }
            } else {
                setError("Unable to connect to server. Please check your connection.");
            }
        } finally {
            isSubmittingRef.current = false;
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-gray-100 dark:bg-slate-950 flex justify-center items-center p-3 sm:p-4 transition-colors">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-5 sm:p-8 shadow-xl">
                <div className="flex justify-center mb-4 text-purple-600 dark:text-purple-400">
                    <LogoIcon size="lg" />
                </div>
                <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white tracking-tight mb-1">
                    Welcome back
                </h1>
                <p className="text-xs text-center text-gray-500 dark:text-slate-400 mb-6">
                    Sign in to access your Brainscratch collection
                </p>

                {/* Google OAuth container */}
                <div id="google-signin-btn" className="flex justify-center mb-3"></div>

                {successMessage && (
                    <div className="mb-4 p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 text-center font-medium">{successMessage}</p>
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
                        signin();
                    }}
                    noValidate
                    className="space-y-3.5"
                >
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                                Username or Email
                            </label>
                        </div>
                        <input
                            value={identifier}
                            onChange={(e) => {
                                setIdentifier(e.target.value);
                                if (fieldErrors.identifier) {
                                    setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
                                }
                            }}
                            placeholder="Enter your username or email"
                            type="text"
                            autoComplete="username"
                            className={`w-full text-sm px-3.5 py-2.5 border rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.identifier
                                    ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-slate-700 focus:ring-purple-500"
                            }`}
                        />
                        {fieldErrors.identifier && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                                {fieldErrors.identifier}
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setForgotPasswordOpen(true)}
                                className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative flex items-center">
                            <input
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (fieldErrors.password) {
                                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                                    }
                                }}
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
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
                            text={loading ? "Signing in..." : "Sign in"}
                        />
                    </div>
                </form>

                <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-6">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                        Sign up
                    </Link>
                </p>

                <ForgotPasswordModal
                    open={forgotPasswordOpen}
                    onClose={() => setForgotPasswordOpen(false)}
                    onSuccess={(msg) => {
                        setSuccessMessage(msg);
                        setError(null);
                    }}
                />
            </div>
        </div>
    );
};
