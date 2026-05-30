"use client";

import React from "react";

interface BlogContentRendererProps {
  content: string;
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  return (
    <div 
      className="prose dark:prose-invert max-w-none text-[18px] leading-[1.8] [font-feature-settings:'calt'_1]
        prose-headings:font-[800] prose-headings:tracking-tight prose-headings:text-[#0e0f0c] dark:prose-headings:text-white
        prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-[1.8]
        prose-img:rounded-[2rem] prose-img:shadow-xl
        prose-a:text-[#0e0f0c] dark:prose-a:text-white prose-a:font-bold prose-a:underline decoration-[#9fe870] decoration-4 underline-offset-4 hover:decoration-[#0e0f0c] dark:hover:decoration-white
        prose-strong:text-[#0e0f0c] dark:prose-strong:text-white prose-strong:font-black
        prose-code:text-[#0e0f0c] dark:prose-code:text-white prose-code:bg-[#f9faf9] dark:prose-code:bg-[#1a1b18] prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:border prose-code:border-gray-200 dark:prose-code:border-white/10 prose-code:before:content-none prose-code:after:content-none
        prose-blockquote:border-l-[#9fe870] prose-blockquote:border-l-8 prose-blockquote:bg-[#f9faf9] dark:prose-blockquote:bg-[#1a1b18] prose-blockquote:py-2 prose-blockquote:pr-6 prose-blockquote:rounded-r-2xl prose-blockquote:font-medium prose-blockquote:italic"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
