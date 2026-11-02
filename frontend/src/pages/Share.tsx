import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URI } from "../config";
import { Card } from "../components/CardComponent/Card";
import { Sidebar } from "../components/sidebar/SidebarComponent";
import { MenuIcon } from "../components/icons/MenuIcon";

interface ContentItem {
    _id?: string;
    title: string;
    link: string;
    type: "twitter" | "youtube";
    tags?: { _id: string; title: string }[];
}

export function Share() {
    const { sharelink } = useParams<{ sharelink: string }>();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [author, setAuthor] = useState<string>("");
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
            } catch (e: any) {
                console.error("Error fetching shared brain:", e);
                setError(e.response?.data?.message || "Failed to load shared brain. The link may be invalid.");
            } finally {
                setLoading(false);
            }
        }

        if (sharelink) {
            fetchSharedBrain();
        }
    }, [sharelink]);

    return (
        <div>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="p-4 md:ml-72 min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors">
            
                <div className="p-4 mb-4 bg-white dark:bg-slate-800 rounded-md border dark:border-slate-700 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer"
                            aria-label="Open sidebar"
                        >
                            <MenuIcon size="md" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                                {author ? `${author}'s Brain` : "Shared Brain"}
                            </h1>
                            <p className="text-gray-500 dark:text-slate-400 text-sm">
                                Viewing public notes and links
                            </p>
                        </div>
                    </div>
                </div>

                
                {loading && (
                    <div className="text-gray-500 dark:text-slate-400 text-center py-10">
                        Loading...
                    </div>
                )}

            
                {error && (
                    <div className="text-red-500 text-center py-10">
                        {error}
                    </div>
                )}

                
                {!loading && !error && contents.length === 0 && (
                    <div className="text-gray-500 dark:text-slate-400 text-center py-10">
                        No content shared in this brain yet.
                    </div>
                )}

                
                <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
                    {contents.map((item, index) => (
                        <Card
                            key={item._id || index}
                            type={item.type}
                            link={item.link}
                            title={item.title}
                            tags={item.tags}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
