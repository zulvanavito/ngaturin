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
}

export type BlogPostMetadata = Omit<BlogPost, 'content'> & {
  reading_time?: number;
};
