import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentModal } from '../components/ContentModal';
import { Card } from '../components/CardComponent/Card';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { MenuIcon } from '../components/icons/MenuIcon';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Sidebar } from '../components/sidebar/SidebarComponent';
import { useContent } from "../components/hooks/useContent";
import axios from 'axios';
import { BACKEND_URI } from '../config';

export function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"twitter" | "youtube" | null>(null);
  const {contents, loading, error, refresh} = useContent();
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  useEffect(() => {
    refresh();
  },[modalOpen]);

  async function handleLogout() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(`${BACKEND_URI}/api/v1/user/logout`, {}, {
          headers: { Authorization: token }
        });
      } catch (err) {
        console.error("Logout request error:", err);
      }
    }
    localStorage.removeItem("token");
    navigate("/signin");
  }

  async function handleShare() {
    try {
      setShareLoading(true);
      setShareError(null);
      
      const token = localStorage.getItem("token");
      console.log("Token being sent:", token);

      const response = await axios.post(
        `${BACKEND_URI}/api/v1/brain/share`,
        { share: true },
        {headers: {
            Authorization: token,
          },
        }
      );

      
      const hash = response.data.hash;

      const shareUrl = `${window.location.origin}/${hash}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Share link copied to clipboard: " + shareUrl);
      } else {
        prompt("Copy your share link:", shareUrl);
      }



    } catch (e: any) {
      console.error("Share error:", e);
      setShareError(e.response?.data?.message || "Failed to share link");
    } finally {
      setShareLoading(false);
    }
  }

  const filteredContents = activeFilter
    ? contents.filter(c => c.type === activeFilter)
    : contents;

  return <div>
    <Sidebar
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      onFilter={setActiveFilter}
      activeFilter={activeFilter}
    />
    <div className="p-4 md:ml-72 min-h-screen bg-gray-100 dark:bg-slate-900 border-2 dark:border-slate-800 transition-colors">
      <ContentModal open={modalOpen} onClose={() => {
        setModalOpen(false);
      }} />

      {shareError && (
          <div className="text-red-500 text-sm mb-2 text-right">{shareError}</div>
        )}

      {error && (
          <div className="text-red-500 text-center py-4">{error}</div>
        )}



      <div className='flex justify-between md:justify-end items-center p-2 gap-2 flex-wrap'>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 cursor-pointer"
          aria-label="Open sidebar"
        >
          <MenuIcon size="md" />
        </button>
        <div className="flex gap-2 items-center flex-wrap">
          <ThemeToggle />
          <Button onClick= {() =>{
            setModalOpen(true)
          }} variant="secondary" size='lg' startIcon={<PlusIcon size= "sm" />} text= "Add Contents" />
          <Button onClick={handleShare} loading={shareLoading} variant="primary" size='lg' startIcon={<ShareIcon size= "sm" />} text= "Share" />
          <Button onClick={handleLogout} variant="secondary" size='lg' text="Logout" />
        </div>
      </div>

      {loading && (
          <div className="text-gray-500 dark:text-slate-400 text-center py-8">Loading your content...</div>
        )}

      <div className='flex gap-4 flex-wrap justify-center sm:justify-start'>
        {filteredContents.length === 0 && !loading && (
          <div className="text-gray-400 dark:text-slate-500 text-center py-8 w-full">
            No {activeFilter ?? ""} content found.
          </div>
        )}
        {filteredContents.map(({_id, type, link, title, tags}, idx) => <Card
        key={_id ?? idx}
        id={_id}
        type={type}
        link={link}
        title={title}
        tags={tags}
        />)}
        
      </div>
    </ div>      
  
  </div>
};
