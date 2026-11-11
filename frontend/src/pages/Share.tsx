import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URI } from "../config";
import { Card } from "../components/CardComponent/Card";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { LogoIcon } from "../components/icons/LogoIcon";
import type { ContentType } from "../utils/urlClassifier";

interface ContentItem {
    _id?: string;
    title: string;
    link?: string;
    body?: string;
    type: ContentType;
    tags?: { _id: string; title: string }[];
}

export function Share() {
    const { sharelink } = useParams<{ sharelink: string }>();
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [author, setAuthor] = useState<string>("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSharedBrain() {
            try {
                setLoading(true);

                const response = await axios.get(`${BACKEND_URI}/api/v1/brain/share/${sharelink}`);

                const fetchedContent = Array.isArray(response.data.content)
                    ? response.data.content
                    : response.data.content ? [response.data.content] : [];

                setContents(fetchedContent);
                setAuthor(response.data.username || "Anonymous");
            } catch (e: unknown) {
                const message = axios.isAxiosError(e) && e.response?.data?.message
                    ? e.response.data.message
                    : "Failed to load shared brain. The link may be invalid.";
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        if (sharelink) {
            fetchSharedBrain();
        }
    }, [sharelink]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors">
            {/* Nav Header */}
            <div className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <LogoIcon size="md" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                            Brainscratch
                        </span>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {author ? `${author}'s Brain` : "Shared Brain"}
                        </h1>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            Public
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Viewing public collection of saved videos, posts, and notes.
                    </p>
                </div>

                {/* Active Tag Filter Banner */}
                {selectedTag && (
                    <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-900/50">
                        <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Filtered by tag:</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-200/70 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200">
                            #{selectedTag}
                            <button
                                type="button"
                                onClick={() => setSelectedTag(null)}
                                className="hover:text-red-500 cursor-pointer font-bold leading-none ml-1"
                                title="Clear tag filter"
                            >
                                ×
                            </button>
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedTag(null)}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer ml-auto"
                        >
                            Clear tag filter
                        </button>
                    </div>
                )}

                {loading && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 py-16 text-center">
                        Loading shared brain...
                    </p>
                )}

                {error && (
                    <div className="text-center py-16">
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                    </div>
                )}

                {!loading && !error && contents.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            No content has been added to this shared brain yet.
                        </p>
                    </div>
                )}

                <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
                    {contents
                        .filter(item => {
                            if (!item) return false;
                            if (!selectedTag) return true;
                            const target = selectedTag.toLowerCase().replace(/^#+/, "");
                            return item.tags?.some(t => {
                                const raw = typeof t === "string" ? t : t?.title || "";
                                return raw.toLowerCase().replace(/^#+/, "") === target;
                            });
                        })
                        .map((item, index) => (
                            <Card
                                key={item._id || index}
                                type={item.type || "text"}
                                link={item.link}
                                body={item.body}
                                title={item.title || item.link || item.body?.slice(0, 30) || "Untitled Note"}
                                tags={item.tags}
                                onTagClick={(tag) => setSelectedTag(tag)}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}
