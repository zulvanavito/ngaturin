"use client";

import { Twitter, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/lib/toast-context";

interface BlogShareSidebarProps {
  title: string;
  slug: string;
}

export function BlogShareSidebar({ title, slug }: BlogShareSidebarProps) {
  const { showToast } = useToast();
  
  // Use absolute URL for sharing. Assuming the domain is ngaturin.web.id
  const url = `https://ngaturin.web.id/blog/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    showToast("success", "Tautan berhasil disalin ke clipboard!");
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "width=550,height=420");
  };

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, "_blank", "width=550,height=420");
  };

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[60px] shrink-0 sticky top-[120px] h-fit z-10">
      <button 
        onClick={handleCopyLink}
        title="Salin Tautan"
        className="w-12 h-12 rounded-full bg-[#f9faf9] dark:bg-[#1a1b18] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#0e0f0c] dark:hover:text-white hover:border-[#9fe870] hover:bg-[#9fe870]/10 transition-all shadow-sm"
      >
        <LinkIcon className="w-5 h-5" />
      </button>
      <button 
        onClick={shareToTwitter}
        title="Bagikan ke Twitter/X"
        className="w-12 h-12 rounded-full bg-[#f9faf9] dark:bg-[#1a1b18] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#1DA1F2] hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all shadow-sm"
      >
        <Twitter className="w-5 h-5" />
      </button>
      <button 
        onClick={shareToFacebook}
        title="Bagikan ke Facebook"
        className="w-12 h-12 rounded-full bg-[#f9faf9] dark:bg-[#1a1b18] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/10 transition-all shadow-sm"
      >
        <Facebook className="w-5 h-5" />
      </button>
      <button 
        onClick={shareToLinkedIn}
        title="Bagikan ke LinkedIn"
        className="w-12 h-12 rounded-full bg-[#f9faf9] dark:bg-[#1a1b18] border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-[#0A66C2] hover:border-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all shadow-sm"
      >
        <Linkedin className="w-5 h-5" />
      </button>
    </aside>
  );
}
