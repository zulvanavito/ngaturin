-- Migration: 024_create_blog_comments.sql
-- Description: Create blog_comments table for guest comments with RLS policies

CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_slug TEXT NOT NULL,
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Set up RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to comments
CREATE POLICY "Allow public read access on blog_comments"
    ON public.blog_comments
    FOR SELECT
    USING (true);

-- Allow public insert access for new comments
CREATE POLICY "Allow public insert on blog_comments"
    ON public.blog_comments
    FOR INSERT
    WITH CHECK (true);

-- Index for faster querying by post_slug
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_slug ON public.blog_comments(post_slug);
