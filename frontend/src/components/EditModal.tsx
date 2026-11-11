import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloseIcon } from "./icons/CloseIcon";
import { Button } from "./ui/Button";
import axios from "axios";
import { BACKEND_URI } from "../config";
import { classifyUrl, type ContentType } from "../utils/urlClassifier";

interface ContentData {
    _id: string;
    title: string;
    link?: string;
    body?: string;
    type: ContentType;
    tags?: { _id: string; title: string }[];
}

interface EditModalProps {
    open: boolean;
    onClose: () => void;
    content: ContentData | null;
}

function EditForm({ content, onClose }: { content: ContentData; onClose: () => void }) {
    const [title, setTitle] = useState(content.title || "");
    const [link, setLink] = useState(content.link || "");
    const [body, setBody] = useState(content.body || "");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>(
        (content.tags || []).map(t => (t.title || "").toLowerCase().replace(/^#+/, "")).filter(Boolean)
    );
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

    async function handleSave() {
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
                link: trimmedLink || null,
                body: trimmedBody || null,
                type: trimmedLink ? classification.type : "text",
                tags: normalizedTags
            };

            await axios.put(
                `${BACKEND_URI}/api/v1/content/edit/${content._id}`,
                payload,
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );
            onClose();
        } catch (e: unknown) {
            let msg = "Failed to update. Please check your connection and try again.";
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
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl transition-all overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-gray-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Edit Item
                    </h2>
                    {link.trim() && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {classification.platformName}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-lg"
                    aria-label="Close modal"
                >
                    <CloseIcon size="sm" />
                </button>
            </div>

            {/* Fields */}
            <div className="px-4 sm:px-5 space-y-3.5 pt-4 max-h-[75vh] overflow-y-auto">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Link (Optional for notes)</label>
                    <input
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        placeholder="URL (YouTube, X, Instagram, LinkedIn, Docs, Notion...)"
                        className="w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                        {link.trim() ? "Personal Notes / Thoughts (Optional)" : "Note Content"}
                    </label>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="Write your note..."
                        rows={3}
                        className="w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Tags</label>
                    <input
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

            {/* Error */}
            {error && (
                <div className="px-5 pt-3">
                    <p className="text-xs text-red-500">{error}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end items-center gap-2 px-4 sm:px-5 py-3.5 sm:py-4 mt-2 border-t border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-900/40">
                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <Button
                    onClick={handleSave}
                    loading={loading}
                    variant="primary"
                    size="md"
                    text={loading ? "Saving..." : "Save Changes"}
                />
            </div>
        </div>
    );
}

export function EditModal({ open, onClose, content }: EditModalProps) {
    return (
        <AnimatePresence>
            {open && content && (
                <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-md my-auto"
                    >
                        <EditForm key={content._id} content={content} onClose={onClose} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
