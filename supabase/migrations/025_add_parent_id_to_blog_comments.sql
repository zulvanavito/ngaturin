-- Migration: 025_add_parent_id_to_blog_comments.sql
-- Description: Add parent_id to blog_comments safely (idempotent)

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_comments' AND column_name='parent_id') THEN
        ALTER TABLE public.blog_comments 
        ADD COLUMN parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Force PostgREST schema cache reload just in case
NOTIFY pgrst, 'reload schema';
