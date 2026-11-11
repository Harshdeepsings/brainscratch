import { LogoIcon } from "../icons/LogoIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { SidebarItems } from "./SidebarItems";
import type { ContentType } from "../../utils/urlClassifier";

export type SidebarFilter = ContentType | "docs" | null;

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    onFilter?: (type: SidebarFilter) => void;
    activeFilter?: SidebarFilter;
    onAddContent?: () => void;
}

function TextIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
    );
}

function DocsSheetsIcon() {
    return (
        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
    );
}

function NotionIcon() {
    return (
        <span className="font-bold text-[10px] size-4 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 flex items-center justify-center">
            N
        </span>
    );
}

export function Sidebar({ isOpen = false, onClose, onFilter, activeFilter, onAddContent }: SidebarProps) {
    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 w-64 max-w-[85vw] z-50 transition-transform duration-200 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo & Brand */}
                    <div className="flex items-center justify-between px-5 py-5">
                        <button
                            type="button"
                            onClick={onAddContent}
                            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
                            title="Add content"
                        >
                            <LogoIcon size="md" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Brainscratch
                            </span>
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-1 md:hidden text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                                aria-label="Close sidebar"
                            >
                                <CloseIcon size="sm" />
                            </button>
                        )}
                    </div>

                    {/* Navigation Filter items */}
                    <div className="px-5 pt-3 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                            Library
                        </span>
                    </div>

                    <nav className="px-3 pb-4 space-y-1 overflow-y-auto flex-1">
                        <SidebarItems
                            startIcon={<span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">All</span>}
                            text="All Items"
                            active={activeFilter === null}
                            onClick={() => onFilter?.(null)}
                        />
                        <SidebarItems
                            startIcon={<YoutubeIcon size="sm" />}
                            text="YouTube"
                            active={activeFilter === "youtube"}
                            onClick={() => onFilter?.(activeFilter === "youtube" ? null : "youtube")}
                        />
                        <SidebarItems
                            startIcon={<TwitterIcon size="sm" />}
                            text="X / Twitter"
                            active={activeFilter === "twitter"}
                            onClick={() => onFilter?.(activeFilter === "twitter" ? null : "twitter")}
                        />
                        <SidebarItems
                            startIcon={<InstagramIcon />}
                            text="Instagram"
                            active={activeFilter === "instagram"}
                            onClick={() => onFilter?.(activeFilter === "instagram" ? null : "instagram")}
                        />
                        <SidebarItems
                            startIcon={<LinkedInIcon />}
                            text="LinkedIn"
                            active={activeFilter === "linkedin"}
                            onClick={() => onFilter?.(activeFilter === "linkedin" ? null : "linkedin")}
                        />
                        <SidebarItems
                            startIcon={<DocsSheetsIcon />}
                            text="Docs & Sheets"
                            active={activeFilter === "docs"}
                            onClick={() => onFilter?.(activeFilter === "docs" ? null : "docs")}
                        />
                        <SidebarItems
                            startIcon={<NotionIcon />}
                            text="Notion"
                            active={activeFilter === "notion"}
                            onClick={() => onFilter?.(activeFilter === "notion" ? null : "notion")}
                        />
                        <SidebarItems
                            startIcon={<TextIcon />}
                            text="Notes"
                            active={activeFilter === "text"}
                            onClick={() => onFilter?.(activeFilter === "text" ? null : "text")}
                        />
                    </nav>
                </div>
            </div>
        </>
    );
}
