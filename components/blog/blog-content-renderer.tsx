"use client";

import React from "react";

interface BlogContentRendererProps {
  content: string;
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  return (
    <div 
      className="prose prose-lg max-w-none 
        prose-headings:font-black prose-headings:tracking-tight prose-headings:text-brand-dark
        prose-p:text-brand-dark/80 prose-p:leading-relaxed
        prose-img:rounded-[2rem] prose-img:shadow-xl
        prose-a:text-brand-dark prose-a:font-bold prose-a:underline decoration-brand-green decoration-4 underline-offset-4 hover:decoration-brand-dark
        prose-strong:text-brand-dark prose-strong:font-black
        prose-code:text-brand-dark prose-code:bg-brand-mint prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
        prose-blockquote:border-l-brand-green prose-blockquote:border-l-8 prose-blockquote:bg-brand-mint/30 prose-blockquote:py-2 prose-blockquote:pr-6 prose-blockquote:rounded-r-2xl prose-blockquote:font-medium prose-blockquote:italic"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
