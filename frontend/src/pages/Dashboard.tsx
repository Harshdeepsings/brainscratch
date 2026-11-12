import { useEffect, useState, useMemo, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ContentModal } from '../components/ContentModal';
import { EditModal } from '../components/EditModal';
import { ProfileModal } from '../components/ProfileModal';
import { Card } from '../components/CardComponent/Card';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { MenuIcon } from '../components/icons/MenuIcon';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Sidebar, type SidebarFilter } from '../components/sidebar/SidebarComponent';
import { useContent } from "../components/hooks/useContent";
import axios from 'axios';
import { BACKEND_URI } from '../config';
import type { ContentType } from '../utils/urlClassifier';

interface ContentItem {
  _id: string;
  title: string;
  link?: string;
  body?: string;
  type: ContentType;
  tags?: { _id: string; title: string }[];
}

export function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SidebarFilter>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [brainCopied, setBrainCopied] = useState(false);
  const {
    contents,
    loading,
    loadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    optimisticDelete
  } = useContent();
  const [search, setSearch] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username: string; email: string; avatar: string } | null>(null);

  useEffect(() => {
    document.title = "Your Brain — Brainscratch";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      localStorage.removeItem("token");
      navigate("/signin");
      return;
    }

    // Fetch user profile for top avatar
    axios.get<{ username: string; email: string; avatar: string }>(
      `${BACKEND_URI}/api/v1/user/profile`,
      { headers: { Authorization: token } }
    ).then(res => {
      setUserProfile(res.data);
    }).catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (!modalOpen && !editModalOpen) {
      refresh();
    }
  }, [modalOpen, editModalOpen, refresh]);

  async function handleLogout() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(`${BACKEND_URI}/api/v1/user/logout`, {}, {
          headers: { Authorization: token }
        });
      } catch {
        // Continue to signin even if network error occurs during logout
      }
    }
    localStorage.removeItem("token");
    navigate("/signin");
  }

  async function handleShare() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await axios.post<{ hash?: string; message?: string }>(
        `${BACKEND_URI}/api/v1/brain/share`,
        { share: true },
        { headers: { Authorization: token } }
      );

      const hash = response.data.hash || response.data.message;
      if (!hash) {
        throw new Error("No share hash returned");
      }
      const shareUrl = `${window.location.origin}/${hash}`;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          prompt("Copy your share link:", shareUrl);
        }
      } catch {
        prompt("Copy your share link:", shareUrl);
      }

      setBrainCopied(true);
      setTimeout(() => setBrainCopied(false), 2000);
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e) && e.response?.data?.message
        ? e.response.data.message
        : "Failed to generate share link";
      alert(msg);
    }
  }

  function handleDelete(id?: string) {
    if (id) {
      optimisticDelete(id);
    } else {
      refresh();
    }
  }

  async function handleDeleteAccount() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    try {
      await axios.delete(`${BACKEND_URI}/api/v1/user/account`, {
        headers: { Authorization: token }
      });
      localStorage.removeItem("token");
      alert("Your account and all associated information have been permanently deleted.");
      navigate("/");
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e) && e.response?.data?.message
        ? e.response.data.message
        : "Failed to delete account. Please try again.";
      alert(msg);
    }
  }

  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    return contents
      .filter(c => {
        if (!c) return false;
        if (!activeFilter) return true;
        const cType = c.type || "text";
        if (activeFilter === "docs") {
          return cType === "googledocs" || cType === "googlesheets";
        }
        return cType === activeFilter;
      })
      .filter(c => {
        if (!selectedTag) return true;
        const targetTag = selectedTag.toLowerCase().replace(/^#+/, "");
        return c.tags?.some(t => {
          const titleStr = typeof t === "string" ? t : t?.title || "";
          return titleStr.toLowerCase().replace(/^#+/, "") === targetTag;
        });
      })
      .filter(c => {
        if (!deferredSearch.trim()) return true;
        const q = deferredSearch.toLowerCase();
        const titleMatch = (c.title || "").toLowerCase().includes(q);
        const bodyMatch = (c.body || "").toLowerCase().includes(q);
        const linkMatch = (c.link || "").toLowerCase().includes(q);
        const tagMatch = c.tags?.some(t => {
          const titleStr = typeof t === "string" ? t : t?.title || "";
          return titleStr.toLowerCase().includes(q);
        });
        return Boolean(titleMatch || bodyMatch || linkMatch || tagMatch);
      });
  }, [contents, activeFilter, selectedTag, deferredSearch]);

  return (
    <div>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onFilter={(filter) => {
          setActiveFilter(filter);
          setSidebarOpen(false);
        }}
        activeFilter={activeFilter}
        onAddContent={() => {
          setSidebarOpen(false);
          setModalOpen(true);
        }}
      />

      <div className="md:ml-64 min-h-screen bg-gray-100 dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 transition-colors">
        <ContentModal open={modalOpen} onClose={() => setModalOpen(false)} />
        <EditModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditingContent(null); }}
          content={editingContent}
        />
        <ProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          initialProfile={userProfile}
          onProfileUpdated={(updated) => setUserProfile(updated)}
        />

        {/* Sticky top action bar */}
        <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 gap-2 sm:gap-3">
            {/* Mobile burger & search bar */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 cursor-pointer shrink-0 transition-colors"
                aria-label="Open sidebar"
              >
                <MenuIcon size="md" />
              </button>

              <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-sm">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search notes, videos..."
                  className="w-full text-xs sm:text-sm pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all truncate"
                />
                <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-gray-400 dark:text-slate-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors cursor-pointer shrink-0"
                title="Add Content"
                aria-label="Add Content"
              >
                <PlusIcon size="sm" />
                <span className="hidden sm:inline">Add Content</span>
              </button>

              <ThemeToggle />

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/70 dark:hover:bg-purple-900/80 border border-purple-200/80 dark:border-purple-900/50 shadow-xs transition-colors cursor-pointer shrink-0"
                title={brainCopied ? "Link Copied!" : "Share Brain"}
                aria-label={brainCopied ? "Link Copied!" : "Share Brain"}
              >
                {brainCopied ? (
                  <svg className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <ShareIcon size="sm" />
                )}
                <span className="hidden lg:inline">{brainCopied ? "Link Copied!" : "Share Brain"}</span>
              </button>

              {/* Profile Icon Button */}
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="relative flex items-center justify-center size-8 sm:size-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs hover:ring-2 hover:ring-purple-400 dark:hover:ring-purple-400 hover:scale-105 transition-all cursor-pointer overflow-hidden border border-purple-400/40 select-none shrink-0"
                title={`Profile (${userProfile?.username || "Account"})`}
                aria-label="User Profile"
              >
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.username || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(userProfile?.username?.trim()[0] || "U").toUpperCase()}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Tag Filter Banner */}
        {selectedTag && (
          <div className="flex flex-wrap items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-purple-50/70 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-900/50">
            <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Filtered by tag:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-200/70 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200">
              #{selectedTag}
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="hover:text-red-500 cursor-pointer font-bold leading-none ml-1"
                title="Clear tag filter"
              >
                ×
              </button>
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer ml-auto"
            >
              Clear tag filter
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="px-3 sm:px-5 pt-3">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Content library */}
        <div className="p-3 sm:p-5 lg:p-6">
          {loading && (
            <p className="text-sm text-gray-500 dark:text-slate-400 py-16 text-center">
              Loading your brain...
            </p>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-12 sm:py-16 px-4">
              <div className="max-w-md mx-auto bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 rounded-xl p-8 sm:p-10 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <PlusIcon size="md" />
                </div>

                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                  {selectedTag
                    ? `No items found with tag #${selectedTag}`
                    : search.trim()
                    ? "No matching items found"
                    : "Your library is empty"}
                </h3>

                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto mb-6">
                  {selectedTag
                    ? "Try clicking another tag or clearing the tag filter."
                    : search.trim()
                    ? `No content matches "${search}". Try searching for another keyword or tag.`
                    : "Preserve your first YouTube video, X post, or personal note."}
                </p>

                {selectedTag ? (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setSelectedTag(null)}
                      variant="secondary"
                      size="md"
                      text="Clear Tag Filter"
                    />
                  </div>
                ) : !search.trim() ? (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setModalOpen(true)}
                      variant="primary"
                      size="md"
                      startIcon={<PlusIcon size="sm" />}
                      text="Add Content"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, idx) => (
                <Card
                  key={item._id ?? idx}
                  id={item._id}
                  type={item.type || "text"}
                  link={item.link}
                  body={item.body}
                  title={item.title || item.link || item.body?.slice(0, 30) || "Untitled Note"}
                  tags={item.tags}
                  onDelete={handleDelete}
                  onTagClick={(tag) => setSelectedTag(tag)}
                  onEdit={() => {
                    if (item._id) {
                      setEditingContent({
                        _id: item._id,
                        title: item.title || item.link || "Untitled Note",
                        link: item.link,
                        body: item.body,
                        type: item.type || "text",
                        tags: item.tags
                      });
                      setEditModalOpen(true);
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Pagination Button */}
          {hasMore && !selectedTag && !search.trim() && !activeFilter && (
            <div className="flex justify-center mt-10 pb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin size-4 text-purple-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Loading more items...</span>
                  </>
                ) : (
                  <span>Load More Content</span>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
