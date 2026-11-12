import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloseIcon } from "./icons/CloseIcon";
import { Button } from "./ui/Button";
import axios from "axios";
import { BACKEND_URI } from "../config";
import { classifyUrl } from "../utils/urlClassifier";

interface ContentModalProps {
    open: boolean;
    onClose: () => void;
}

export function ContentModal({ open, onClose }: ContentModalProps) {
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [body, setBody] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Auto-detect classification from URL in real-time
    const classification = classifyUrl(link);

    function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const value = tagInput.trim().toLowerCase().replace(/^#+/, "");
            if (value && !tags.includes(value)) {
                setTags(prev => [...prev, value]);
            }
            setTagInput("");
        }
    }

    function removeTag(tag: string) {
        setTags(prev => prev.filter(t => t !== tag));
    }

    function reset() {
        setTitle("");
        setLink("");
        setBody("");
        setTagInput("");
        setTags([]);
        setError(null);
        setLoading(false);
    }

    function handleClose() {
        reset();
        onClose();
    }

    async function handleSubmit() {
        setError(null);

        const trimmedTitle = title.trim();
        const trimmedLink = link.trim();
        const trimmedBody = body.trim();

        if (!trimmedTitle) {
            setError("Title is required.");
            return;
        }

        if (!trimmedLink && !trimmedBody) {
            setError("Please provide either a URL or note content.");
            return;
        }

        // Include any uncommitted tag typed in the tag input field and ensure lowercase without '#'
        const pendingTag = tagInput.trim().toLowerCase().replace(/^#+/, "");
        const rawTags = pendingTag && !tags.includes(pendingTag) ? [...tags, pendingTag] : [...tags];
        const normalizedTags = Array.from(
            new Set(rawTags.map(t => t.trim().toLowerCase().replace(/^#+/, "")).filter(Boolean))
        );

        setLoading(true);

        try {
            const payload: Record<string, unknown> = {
                title: trimmedTitle,
                type: classification.type,
                tags: normalizedTags
            };

            if (trimmedLink) {
                payload.link = trimmedLink;
            }
            if (trimmedBody) {
                payload.body = trimmedBody;
            }

            const token = localStorage.getItem("token");
            if (!token || token === "undefined" || token === "null") {
                setError("You must be signed in to add content. Please sign in.");
                setLoading(false);
                return;
            }

            await axios.post(`${BACKEND_URI}/api/v1/content/post`, payload, {
                headers: {
                    Authorization: token
                }
            });
            handleClose();
        } catch (e: unknown) {
            let msg = "Failed to add content. Please check your connection and try again.";
            if (axios.isAxiosError(e)) {
                if (e.response?.data?.errors) {
                    const firstField = Object.values(e.response.data.errors).flat()[0];
                    if (firstField) {
                        msg = String(firstField);
                    }
                } else if (e.response?.data?.message) {
                    msg = e.response.data.message;
                }
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl my-auto overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-gray-100 dark:border-slate-700/60">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Add to your brain
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-lg"
                                aria-label="Close modal"
                            >
                                <CloseIcon size="sm" />
                            </button>
                        </div>

                        {/* Input Fields */}
                        <div className="px-4 sm:px-5 space-y-3.5 pt-4 max-h-[75vh] overflow-y-auto">
                    {/* Link / URL input with real-time detection badge */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300">
                                Link (Optional for Notes)
                            </label>
                            {link.trim() && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    {classification.platformName}
                                </span>
                            )}
                        </div>
                        <input
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            placeholder="Paste YouTube, X, Instagram, LinkedIn, Docs, Sheets, or Notion URL..."
                            className="w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Title (e.g. Quarterly Strategy, System Architecture)"
                            className="w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Notes / Body */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                            {link.trim() ? "Personal Notes / Thoughts (Optional)" : "Note Content"}
                        </label>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="Write your notes, key takeaways, or thoughts here..."
                            rows={3}
                            className="w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                    </div>

                    {/* Tags Input */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Tags</label>
                        <input
                            ref={tagInputRef}
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value.toLowerCase())}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Type a tag and press Enter (always lowercase)"
                            className="w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-red-500 cursor-pointer leading-none ml-0.5"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="px-5 pt-3">
                        <p className="text-xs text-red-500">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end items-center gap-2 px-4 sm:px-5 py-3.5 sm:py-4 mt-2 border-t border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-900/40">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={handleSubmit}
                        loading={loading}
                        variant="primary"
                        size="md"
                        text={loading ? "Saving..." : "Save Content"}
                    />
                </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
