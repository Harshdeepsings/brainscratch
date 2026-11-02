import { useEffect } from "react";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Notebook } from "../icons/NotebookIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { BACKEND_URI } from "../../config";


interface CardProps {
    id?: string;
    title: string;
    link: string;
    type: "twitter" | "youtube" ;
    onDelete?: (id: string) => void;

};

function getYoutubeEmbedUrl(url: string) {
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}


export function Card({id,title, link, type, onDelete}: CardProps){
    useEffect(() => {
        if (type === "twitter") {
            (window as any).twttr?.widgets?.load();
        }
    }, [link, type]);

    return <div className="w-full sm:w-auto">
        <div className="bg-white dark:bg-slate-800 rounded-md border-gray-200 dark:border-slate-700 w-full sm:w-76 max-w-full sm:max-w-76 border h-80 sm:min-w-72 p-4 box-border flex flex-col transition-colors">           
            <div className="flex justify-between items-center shrink-0">
                <div className="flex text-md font-medium items-center truncate mr-2 text-gray-800 dark:text-slate-100">
                    <div className="text-gray-600 dark:text-slate-400 pr-2 shrink-0">
                        <Notebook size="md"/>
                    </div>                   
                    <span className="truncate">{title}</span>
                </div> 
                <div className="flex justify-center items-center shrink-0">
                    
                    <div className="p-2 text-gray-600 dark:text-slate-400">
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(`${BACKEND_URI}/api/v1/brain/share`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": localStorage.getItem("token") || ""
                                        },
                                        body: JSON.stringify({ share: true })
                                    });
                                    const data = await res.json();
                                    const hash = data.hash || data.message;
                                    const shareUrl = `${window.location.origin}/${hash}`;
                                    await navigator.clipboard.writeText(shareUrl);
                                    alert("Share link copied!");
                                } catch {
                                    alert("Failed to copy share link.");
                                }
                            }}
                            className="p-2 text-gray-600 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 transition cursor-pointer"
                        >
                            <ShareIcon size="md" />
                        </button >

                    </div>
                    {onDelete && id && (
                        <button
                            onClick={async () => {
                                try {
                                    await fetch(`${BACKEND_URI}/api/v1/content/delete/${id}`, {
                                        method: "DELETE",
                                        headers: {
                                            "Authorization": localStorage.getItem("token") || ""
                                        }
                                    });
                                    onDelete(id);
                                } catch {
                                    alert("Failed to delete content.");
                                }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition cursor-pointer"
                        >
                            <DeleteIcon size="md" />
                        </button>
                    )}
                </div>
            </div>

            <div className="pt-4 flex-1 overflow-y-auto overflow-x-hidden">
                {type === "youtube" && <iframe className="w-full aspect-video rounded" src={getYoutubeEmbedUrl(link)}
                title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}

                {type === "twitter" && <div className="w-full overflow-x-auto"><blockquote className="twitter-tweet" data-conversation="none">
                    <a href={link.replace("x.com", "twitter.com")} />
                </blockquote></div>}
            </div>
        </div>
    </div>
};