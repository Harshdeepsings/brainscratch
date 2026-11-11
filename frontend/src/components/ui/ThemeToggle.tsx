import { useEffect, useState } from "react";
import { SunIcon } from "../icons/SunIcon";
import { MoonIcon } from "../icons/MoonIcon";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme");
            if (saved) return saved === "dark";
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(prev => !prev)}
            className="p-2 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-transform duration-150 ease-out active:scale-[0.95] flex items-center justify-center"
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDark ? <SunIcon size="sm" /> : <MoonIcon size="sm" />}
        </button>
    );
}
