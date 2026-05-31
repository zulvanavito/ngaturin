export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image_url?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  author_id: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  reading_time?: number;
  view_count?: number;
  blog_authors?: {
    name: string;
    avatar_url?: string | null;
    bio?: string | null;
  };
}

export type BlogPostMetadata = Omit<BlogPost, 'content'> & {
  reading_time?: number;
};
