import { LogoIcon } from "../icons/LogoIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { SidebarItems } from "./SidebarItems";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    onFilter?: (type: "twitter" | "youtube" | null) => void;
    activeFilter?: "twitter" | "youtube" | null;
}

export function Sidebar({ isOpen = false, onClose, onFilter, activeFilter }: SidebarProps){
    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar container */}
            <div className={`h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r dark:border-slate-800 w-72 z-50 transition-transform duration-200 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}>
                <div className="pt-4">
                    <div className="flex items-center justify-between px-4 md:px-1">
                        <div className="flex items-center">
                            <div className='pr-2'>
                                <LogoIcon size="lg" />
                            </div>
                            <div className="flex text-3xl font-bold text-gray-900 dark:text-white">
                                Brainscratch
                            </div>
                        </div>
                        {onClose && (
                            <button 
                                onClick={onClose}
                                className="p-1 md:hidden text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                                aria-label="Close sidebar"
                            >
                                <CloseIcon size="md" />
                            </button>
                        )}
                    </div>
                    <div className=" pt-10 pl-4 text-xl ">
                        <div className="flex items-center pb-5">
                            <SidebarItems
                                startIcon={<TwitterIcon size="md" />}
                                text="Twitter"
                                active={activeFilter === "twitter"}
                                onClick={() => onFilter?.(activeFilter === "twitter" ? null : "twitter")}
                            />
                        </div>
                        <div className="flex items-center">
                            <SidebarItems
                                startIcon={<YoutubeIcon size="md" />}
                                text="Youtube"
                                active={activeFilter === "youtube"}
                                onClick={() => onFilter?.(activeFilter === "youtube" ? null : "youtube")}
                            />
                        </div>
                    </div>
                    
                </div>
            </div>
        </>
    );
};