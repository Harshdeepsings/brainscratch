import axios from "axios";
import { useEffect, useState } from "react"
import { BACKEND_URI } from "../../config";

interface Content {
    _id?: string;
    title: string;
    link: string;
    type: "twitter" | "youtube";
    tags?: { _id: string; title: string }[];
}

export function useContent() {
    const [contents, setContents] = useState<Content[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    function refresh(){
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        axios.get(`${BACKEND_URI}/api/v1/user/content`, {
            headers: {
                Authorization: token
            }    
        })
        .then((response) => {
            setContents(response.data.content || []);
            setError(null);
        })
        .catch((err) => {
            setError(err.response?.data?.message || "Failed to load content");
        })
        .finally(() => {
            setLoading(false);
        });
    }
    
    useEffect(() => {
        refresh();

        const interval = setInterval(()=> {
            refresh();
        }, 5000);

        return () => {
            clearInterval(interval);
        } 
    }, []);

    return {contents, loading, error, refresh};
}