"use client";

import React from "react";

interface BlogContentRendererProps {
  content: string;
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  return (
    <div 
      className="prose dark:prose-invert max-w-none [font-feature-settings:'calt'_1]"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
