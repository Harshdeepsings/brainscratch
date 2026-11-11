import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { BACKEND_URI } from "../../config";
import type { ContentType } from "../../utils/urlClassifier";

export interface Content {
    _id?: string;
    title: string;
    link?: string;
    body?: string;
    type: ContentType;
    tags?: { _id: string; title: string }[];
}

interface ContentResponse {
    content?: Content[];
    total?: number;
    hasMore?: boolean;
    page?: number;
}

export function useContent() {
    const [contents, setContents] = useState<Content[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(0);

    const refresh = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token || token === "undefined" || token === "null") {
            setContents([]);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get<ContentResponse | Content[]>(`${BACKEND_URI}/api/v1/user/content?page=1&limit=18`, {
                headers: {
                    Authorization: token
                }
            });

            const data = response.data;
            const items: Content[] = Array.isArray(data)
                ? data
                : (data?.content || []);

            setContents(items);
            setTotal(Array.isArray(data) ? items.length : (data?.total ?? items.length));
            setHasMore(Array.isArray(data) ? false : Boolean(data?.hasMore));
            setPage(1);
            setError(null);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
                localStorage.removeItem("token");
                window.location.href = "/signin";
                return;
            }
            const message = axios.isAxiosError(err) && err.response?.data?.message
                ? err.response.data.message
                : "Failed to load content";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingMore(true);
        const nextPage = page + 1;

        try {
            const response = await axios.get<ContentResponse | Content[]>(`${BACKEND_URI}/api/v1/user/content?page=${nextPage}&limit=18`, {
                headers: {
                    Authorization: token
                }
            });

            const data = response.data;
            const newItems: Content[] = Array.isArray(data)
                ? data
                : (data?.content || []);

            setContents(prev => {
                const existingIds = new Set(prev.map(item => item._id));
                const deduplicated = newItems.filter(item => !item._id || !existingIds.has(item._id));
                return [...prev, ...deduplicated];
            });

            setPage(nextPage);
            setHasMore(Array.isArray(data) ? false : Boolean(data?.hasMore));
        } catch (err: unknown) {
            console.error("Failed to load more content:", err);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, page]);

    // Optimistic mutation helpers
    const optimisticDelete = useCallback((id: string) => {
        setContents(prev => prev.filter(c => c._id !== id));
        setTotal(prev => Math.max(0, prev - 1));
    }, []);

    const optimisticAdd = useCallback((newItem: Content) => {
        setContents(prev => [newItem, ...prev]);
        setTotal(prev => prev + 1);
    }, []);

    const optimisticUpdate = useCallback((id: string, updates: Partial<Content>) => {
        setContents(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
        }, 15000);

        return () => {
            clearInterval(interval);
        };
    }, [refresh]);

    return {
        contents,
        error,
        loading,
        loadingMore,
        hasMore,
        total,
        refresh,
        loadMore,
        optimisticDelete,
        optimisticAdd,
        optimisticUpdate,
        setContents
    };
}
