import { useRef, useState } from "react";
import { CloseIcon } from "./icons/CloseIcon";
import { Input } from "./InputComponent";
import { Button } from "./ui/Button";
import axios from "axios";
import { BACKEND_URI } from "../config";

interface ContentModalProps {
    open: boolean;
    onClose: () => void;
}

enum ContentType {
    YouTube = "youtube",
    Twitter = "twitter"
}

export function ContentModal({open, onClose}: ContentModalProps){
    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const [type, setType] = useState(ContentType.YouTube);
    const [tags, setTags] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const value = tagInputRef.current?.value.trim().toLowerCase();
            if (value && !tags.includes(value)) {
                setTags(prev => [...prev, value]);
            }
            if (tagInputRef.current) tagInputRef.current.value = "";
        }
    }

    function removeTag(tag: string) {
        setTags(prev => prev.filter(t => t !== tag));
    }

    function handleClose() {
        setTags([]);
        setError(null);
        if (tagInputRef.current) tagInputRef.current.value = "";
        onClose();
    }

    async function addContent() {
       const title = titleRef.current?.value;
       const link = linkRef.current?.value;

       setError(null);
       setLoading(true);

       try {
           await axios.post(`${BACKEND_URI}/api/v1/content/post`, {
                link,
                title,
                type,
                tags
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            handleClose();
        } catch(e: any) {
            const msg = e.response?.data?.message || "Failed to add content. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return <div>
        {open && <div className="w-full h-screen fixed inset-0 bg-gray-600/75 dark:bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="flex flex-col justify-center w-full max-w-sm my-auto">
                    <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded w-full shadow-lg text-gray-900 dark:text-slate-100">
                        <div className="flex justify-end">
                            <div onClick={handleClose} className="cursor-pointer text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white">
                                <CloseIcon size="md"/>
                            </div>
                        </div>

                        <div>
                            <Input reference={titleRef} placeholder={"Title"} type="text" />
                            <Input reference={linkRef} placeholder={"Link"} type="text" />

                            {/* Tag input */}
                            <div className="mt-2">
                                <input
                                    ref={tagInputRef}
                                    onKeyDown={handleTagKeyDown}
                                    type="text"
                                    placeholder="Add tags (press Enter)"
                                    className="w-full border border-gray-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full"
                                            >
                                                #{tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-0.5 hover:text-red-500 cursor-pointer leading-none"
                                                >×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-gray-700 dark:text-slate-300 mt-2">Type</h1>
                                <div className="flex justify-center gap-2 p-4">
                                    <Button text="Youtube" variant={type === ContentType.YouTube ? "primary" : "secondary"}
                                     size="md" onClick={() => setType(ContentType.YouTube)} />
                                    <Button text="Twitter" variant={type === ContentType.Twitter ? "primary" : "secondary"}
                                     size="md" onClick={() => setType(ContentType.Twitter)} />
                                </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center pb-2">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center rounded pt-2">
                            <Button onClick={addContent} loading={loading} variant="primary" text="Submit" size="lg" />
                        </div>
                    </div>
                </div>
            </div>}
    </div>
};