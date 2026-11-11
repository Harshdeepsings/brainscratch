import type { ReactElement } from "react"

interface SidebarItemsProps {
    startIcon: ReactElement;
    text: string;
    onClick?: () => void;
    active?: boolean;
}

export const SidebarItems = (props: SidebarItemsProps) => {
    return (
        <div
            onClick={props.onClick}
            className={`flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md text-sm font-medium transition-all duration-150
                ${props.active
                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
        >
            <span className="shrink-0">{props.startIcon}</span>
            <span>{props.text}</span>
        </div>
    );
}
