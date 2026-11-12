import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Notebook } from "../icons/NotebookIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { ErrorBoundary } from "../ErrorBoundary";
import { BACKEND_URI } from "../../config";
import { classifyUrl, type ContentType } from "../../utils/urlClassifier";

interface CardProps {
    id?: string;
    title: string;
    link?: string;
    body?: string;
    type: ContentType;
    tags?: { _id: string; title: string }[];
    onDelete?: (id: string) => void;
    onEdit?: () => void;
    onTagClick?: (tag: string) => void;
}

interface TwitterWindow extends Window {
    twttr?: {
        widgets?: {
            load: () => void;
        };
    };
}

export function Card({ id, title, link, body, type, tags, onDelete, onEdit, onTagClick }: CardProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (type === "twitter") {
            const win = window as unknown as TwitterWindow;
            win.twttr?.widgets?.load();
        }
    }, [link, type]);

    const classification = link ? classifyUrl(link) : null;
    const resolvedType = type || classification?.type || "text";
    const embedUrl = classification?.embedUrl;
    const displayTitle = title || link || body?.slice(0, 30) || "Untitled Note";

    const handleCopy = async () => {
        try {
            const shareTarget = link || body || "";
            if (shareTarget) {
                let copiedSuccessfully = false;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                        await navigator.clipboard.writeText(shareTarget);
                        copiedSuccessfully = true;
                    } catch {
                        prompt("Copy item:", shareTarget);
                        copiedSuccessfully = true;
                    }
                } else {
                    prompt("Copy item:", shareTarget);
                    copiedSuccessfully = true;
                }
                if (copiedSuccessfully) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
                return;
            }

            // Fallback for notes without link: generate public share link if signed in
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${BACKEND_URI}/api/v1/brain/share`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ share: true })
            });
            const data = (await res.json()) as { hash?: string; message?: string };
            if (res.ok) {
                const hash = data.hash || data.message;
                if (hash) {
                    const shareUrl = `${window.location.origin}/${hash}`;
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        try {
                            await navigator.clipboard.writeText(shareUrl);
                        } catch {
                            prompt("Copy item:", shareUrl);
                        }
                    } else {
                        prompt("Copy item:", shareUrl);
                    }
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            }
        } catch (err: unknown) {
            console.error("Copy failed:", err);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full sm:w-auto"
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/90 dark:border-slate-700/80 w-full sm:w-80 max-w-full sm:max-w-80 h-96 sm:min-w-72 p-4 box-border flex flex-col transition-shadow shadow-xs hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/60">
                {/* Header row */}
                <div className="flex justify-between items-center shrink-0">
                    <div className="flex text-sm font-semibold items-center truncate mr-2 text-gray-800 dark:text-slate-100">
                        <div className="pr-2 shrink-0">
                            {resolvedType === "youtube" && (
                                <span className="flex items-center justify-center p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                                    <YoutubeIcon size="sm" />
                                </span>
                            )}
                            {resolvedType === "twitter" && (
                                <span className="flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                                    <TwitterIcon size="sm" />
                                </span>
                            )}
                            {resolvedType === "instagram" && (
                                <span className="flex items-center justify-center p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </span>
                            )}
                            {resolvedType === "linkedin" && (
                                <span className="flex items-center justify-center p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                    </svg>
                                </span>
                            )}
                            {resolvedType === "googledocs" && (
                                <span className="flex items-center justify-center p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-500">
                                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                    </svg>
                                </span>
                            )}
                            {resolvedType === "googlesheets" && (
                                <span className="flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H5v-2h4v2zm0-4H5v-2h4v2zm0-4H5V7h4v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z" />
                                    </svg>
                                </span>
                            )}
                            {resolvedType === "notion" && (
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs border border-neutral-300/80 dark:border-neutral-600">
                                    N
                                </span>
                            )}
                            {resolvedType === "text" && (
                                <span className="flex items-center justify-center p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                                    <Notebook size="md" />
                                </span>
                            )}
                        </div>
                        <span className="truncate" title={displayTitle}>{displayTitle}</span>
                    </div>
                    <div className="flex items-center shrink-0 gap-0.5">
                        {/* Copy / Share button with temporary checkmark feedback */}
                        <button
                            onClick={handleCopy}
                            className="relative flex items-center gap-1 p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700/60 dark:text-slate-400 dark:hover:text-purple-400 transition-colors cursor-pointer rounded-lg"
                            title={link ? "Copy link" : "Share item"}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {copied ? (
                                    <motion.span
                                        key="check"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                                    >
                                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                        <span>Copied!</span>
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="share"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <ShareIcon size="sm" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>

                        {/* Edit */}
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700/60 dark:text-slate-400 dark:hover:text-purple-400 transition-colors cursor-pointer rounded-lg"
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                </svg>
                            </button>
                        )}

                        {/* Delete */}
                        {onDelete && id && (
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`${BACKEND_URI}/api/v1/content/delete/${id}`, {
                                            method: "DELETE",
                                            headers: {
                                                "Authorization": localStorage.getItem("token") || ""
                                            }
                                        });
                                        if (res.ok) {
                                            onDelete(id);
                                        } else {
                                            alert("Failed to delete content.");
                                        }
                                    } catch {
                                        alert("Failed to delete content.");
                                    }
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer rounded-lg"
                                title="Delete"
                            >
                                <DeleteIcon size="sm" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content preview area */}
                <div className="pt-3 pb-1 flex-1 overflow-y-auto overflow-x-hidden">
                    <ErrorBoundary fallback={
                        <div className="h-40 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center p-3 text-center">
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Embed preview failed to load.</p>
                            {link && (
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 dark:text-purple-400 underline">
                                    Open Link Directly
                                </a>
                            )}
                        </div>
                    }>
                    {/* YouTube Embed */}
                    {resolvedType === "youtube" && embedUrl && (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-200/80 dark:border-slate-700/80 shadow-xs">
                            <iframe
                                className="w-full h-full"
                                src={embedUrl}
                                title={title || "YouTube video player"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                sandbox="allow-scripts allow-same-origin allow-presentation"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Instagram Embed */}
                    {resolvedType === "instagram" && (
                        <div className="flex flex-col gap-2">
                            {embedUrl && (
                                <div className="relative h-56 w-full rounded-xl overflow-hidden bg-white border border-gray-200/80 dark:border-slate-700/80 shadow-xs">
                                    <iframe
                                        className="w-full h-full"
                                        src={embedUrl}
                                        title={title || "Instagram post"}
                                        scrolling="no"
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            )}
                            {link && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-pink-700 dark:text-pink-300 bg-pink-50/80 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/60 border border-pink-200/70 dark:border-pink-900/40 rounded-lg transition-colors"
                                >
                                    <span>View on Instagram</span>
                                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}

                    {/* LinkedIn Embed */}
                    {resolvedType === "linkedin" && (
                        <div className="flex flex-col gap-2">
                            {embedUrl ? (
                                <div className="relative h-56 w-full rounded-xl overflow-hidden bg-white border border-gray-200/80 dark:border-slate-700/80 shadow-xs">
                                    <iframe
                                        className="w-full h-full"
                                        src={embedUrl}
                                        title={title || "LinkedIn post"}
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-slate-900/60 border border-blue-100 dark:border-slate-700/70 text-center flex flex-col items-center justify-center min-h-[140px]">
                                    <div className="w-10 h-10 mb-2 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-blue-900 dark:text-blue-300 font-semibold mb-0.5">LinkedIn Post</p>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1 max-w-full px-2">{title}</p>
                                </div>
                            )}
                            {link && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                                >
                                    <span>View on LinkedIn</span>
                                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Google Docs Embed */}
                    {resolvedType === "googledocs" && (
                        <div className="flex flex-col gap-2">
                            {embedUrl && (
                                <div className="relative h-56 w-full rounded-xl overflow-hidden bg-white border border-gray-200/80 dark:border-slate-700/80 shadow-xs">
                                    <iframe
                                        className="w-full h-full"
                                        src={embedUrl}
                                        title={title || "Google Docs preview"}
                                        sandbox="allow-scripts allow-same-origin allow-popups"
                                    />
                                </div>
                            )}
                            {link && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/70 dark:border-blue-900/40 rounded-lg transition-colors"
                                >
                                    <span>Open in Google Docs</span>
                                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Google Sheets Embed */}
                    {resolvedType === "googlesheets" && (
                        <div className="flex flex-col gap-2">
                            {embedUrl && (
                                <div className="relative h-56 w-full rounded-xl overflow-hidden bg-white border border-gray-200/80 dark:border-slate-700/80 shadow-xs">
                                    <iframe
                                        className="w-full h-full"
                                        src={embedUrl}
                                        title={title || "Google Sheets preview"}
                                        sandbox="allow-scripts allow-same-origin allow-popups"
                                    />
                                </div>
                            )}
                            {link && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/70 dark:border-emerald-900/40 rounded-lg transition-colors"
                                >
                                    <span>Open in Google Sheets</span>
                                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Notion Embed */}
                    {resolvedType === "notion" && link && (
                        <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-slate-900/60 border border-neutral-200/80 dark:border-slate-700/80 text-center flex flex-col items-center justify-center min-h-[160px]">
                            <div className="w-10 h-10 mb-2.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-sm text-neutral-800 dark:text-neutral-100 shadow-xs">
                                N
                            </div>
                            <p className="text-xs text-neutral-800 dark:text-neutral-200 font-semibold mb-1">Notion Document</p>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-3 line-clamp-2 px-2">{title}</p>
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3.5 text-xs font-semibold text-neutral-800 dark:text-white bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-300/80 dark:border-neutral-700 rounded-lg transition-colors"
                            >
                                <span>Open in Notion</span>
                                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    )}

                    {/* X / Twitter Embed */}
                    {resolvedType === "twitter" && link && (
                        <div className="w-full max-h-64 overflow-y-auto rounded-xl border border-gray-100 dark:border-slate-700/60 bg-gray-50/40 dark:bg-slate-900/40 p-2">
                            <blockquote className="twitter-tweet" data-conversation="none">
                                <a href={link.replace("x.com", "twitter.com")} target="_blank" rel="noopener noreferrer">
                                    View Post
                                </a>
                            </blockquote>
                        </div>
                    )}

                    {/* Note body */}
                    {body && (
                        <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-gray-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-gray-100 dark:border-slate-700/60 mb-2">
                            {body}
                        </p>
                    )}

                    {/* Generic link bookmark preview */}
                    {resolvedType === "text" && !body && link && (
                        <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200/80 dark:border-slate-700/80 flex flex-col justify-between">
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 truncate">{link}</p>
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                <span>Open Web Resource</span>
                                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    )}
                    </ErrorBoundary>
                </div>

                {/* Tags (clickable filter, always lowercase without '#') */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2.5 shrink-0 border-t border-gray-100 dark:border-slate-700/50 mt-auto">
                        {tags.map((tag, idx) => {
                            const rawTitle = typeof tag === "string" ? tag : tag?.title || "";
                            const cleanTag = rawTitle.toLowerCase().replace(/^#+/, "");
                            if (!cleanTag) return null;
                            const tagKey = (typeof tag === "object" && tag?._id) ? tag._id : `${cleanTag}-${idx}`;
                            return (
                                <button
                                    type="button"
                                    key={tagKey}
                                    onClick={() => onTagClick?.(cleanTag)}
                                    className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:border-purple-300 transition-colors cursor-pointer"
                                    title={`Filter by #${cleanTag}`}
                                >
                                    #{cleanTag}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
