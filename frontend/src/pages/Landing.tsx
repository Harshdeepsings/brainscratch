import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogoIcon } from "../components/icons/LogoIcon";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { YoutubeIcon } from "../components/icons/YoutubeIcon";
import { TwitterIcon } from "../components/icons/TwitterIcon";
import { Notebook } from "../components/icons/NotebookIcon";
import { ShareIcon } from "../components/icons/ShareIcon";

export function Landing() {
    useEffect(() => {
        document.title = "Brainscratch — Your Second Brain for Bookmarks, Notes & Media";
    }, []);

    const [hasToken] = useState(() => {
        if (typeof window === "undefined") return false;
        const token = localStorage.getItem("token");
        return Boolean(token && token !== "undefined" && token !== "null");
    });

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            {/* Navigation */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="text-purple-600 dark:text-purple-400">
                            <LogoIcon size="md" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                            Brainscratch
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {hasToken ? (
                            <Link
                                to="/dashboard"
                                className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/signin"
                                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-xs"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 max-w-5xl mx-auto text-center">
                {/* Main Headline */}
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                    Save what inspires you. <br />
                    <span className="text-purple-600 dark:text-purple-400">Find it when you need it.</span>
                </h1>

                <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Brainscratch connects YouTube lectures, discussions on X, and rich personal notes into a single searchable library. Stop losing valuable links across tabs.
                </p>

                {/* Call to Actions */}
                <div className="mt-10 flex flex-wrap gap-3.5 justify-center items-center">
                    {hasToken ? (
                        <Link
                            to="/dashboard"
                            className="text-sm sm:text-base font-medium bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-sm transition-all"
                        >
                            Open Your Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/signup"
                                className="text-sm sm:text-base font-medium bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-sm transition-all"
                            >
                                Start Collecting Free
                            </Link>
                            <Link
                                to="/signin"
                                className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                            >
                                Sign in to account
                            </Link>
                        </>
                    )}
                </div>

                {/* Product Showcase Window Mockup */}
                <div className="mt-16 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden text-left">
                    {/* Window Controls & Search Bar */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="size-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span>
                            <span className="size-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span>
                            <span className="size-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-md text-xs text-slate-500 dark:text-slate-400 w-64 max-w-full">
                            <svg className="size-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="truncate">Search notes, videos, tags...</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <span>Library</span>
                        </div>
                    </div>

                    {/* Content Cards Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* YouTube Card */}
                        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4.5 flex flex-col justify-between h-56 shadow-xs">
                            <div>
                                <div className="flex items-center justify-between mb-3 text-red-600 dark:text-red-400">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                                        <YoutubeIcon size="sm" />
                                        <span>YouTube Video</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-mono">18:42</span>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                                    Distributed Consensus Protocols: Understanding Raft and Paxos
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                                    In-depth visualization of state machine replication, leader election, and log consistency.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">#architecture</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">#systems</span>
                            </div>
                        </div>

                        {/* Twitter / X Card */}
                        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4.5 flex flex-col justify-between h-56 shadow-xs">
                            <div>
                                <div className="flex items-center justify-between mb-3 text-slate-800 dark:text-slate-200">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                                        <TwitterIcon size="sm" />
                                        <span>Post on X</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400">@dan_abramov</span>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                                    Principles for designing clear data models in modern reactive applications
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                                    Treat state transitions as pure intents. Minimize derived cache synchronization bugs.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">#frontend</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">#state</span>
                            </div>
                        </div>

                        {/* Personal Note Card */}
                        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4.5 flex flex-col justify-between h-56 shadow-xs">
                            <div>
                                <div className="flex items-center justify-between mb-3 text-purple-600 dark:text-purple-400">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                                        <Notebook size="sm" />
                                        <span>Note</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-mono">Updated today</span>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                                    Quarterly Engineering Roadmap & API Contracts
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                                    Migrate authentication to verified JWTs, establish Redis token invalidation, enforce rate limits.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">#planning</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">#security</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Capabilities */}
            <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-800">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                        Purpose-built workflow
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Designed for researchers, builders, and deep learners.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                        <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                            <Notebook size="md" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                            Multi-Format Ingestion
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Embed YouTube lectures, archive tweets with rich media, and write freeform notes without wrestling with messy browser bookmarks.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                        <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                            <svg className="size-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                            Instant Tagging & Retrieval
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Organize content dynamically with flexible hashtags. Real-time client-side search instantly filters by titles, bodies, and tags.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                        <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                            <ShareIcon size="sm" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                            Public Brain Sharing
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Publish a clean, read-only view of your curated library with a single click. Share your research with colleagues without accounts required.
                        </p>
                    </div>
                </div>
            </section>

            {/* Professional Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pt-16 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Top Row: Brand Info + Navigation Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800/80">
                        {/* Brand Column (spans 2 on desktop) */}
                        <div className="col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="text-purple-600 dark:text-purple-400">
                                    <LogoIcon size="md" />
                                </div>
                                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                    Brainscratch
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                                A unified digital memory designed to capture, organize, and retrieve your videos, threads, and personal knowledge with zero friction.
                            </p>
                        </div>

                        {/* Product Column */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                                Product
                            </h4>
                            <ul className="space-y-2.5 text-sm">
                                <li>
                                    <Link to="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                        Personal Library
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/signup" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                        Quick Capture
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                        Share Links
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                        Tag Taxonomy
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Integrations Column */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                                Integrations
                            </h4>
                            <ul className="space-y-2.5 text-sm">
                                <li>
                                    <span className="text-slate-600 dark:text-slate-400">
                                        YouTube Embeds
                                    </span>
                                </li>
                                <li>
                                    <span className="text-slate-600 dark:text-slate-400">
                                        X / Twitter Threads
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Account Column */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                                Account
                            </h4>
                            <ul className="space-y-2.5 text-sm">
                                <li>
                                    <Link to="/signin" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                        Sign In
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/signup" className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                        Create Account
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Row: Copyright + Legal Links */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <p>© {new Date().getFullYear()} Brainscratch. All rights reserved.</p>

                        <div className="flex items-center gap-6">
                            <Link to="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
