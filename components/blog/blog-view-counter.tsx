"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function BlogViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const incrementView = async () => {
      const supabase = createClient();
      await supabase.rpc('increment_post_view', { post_slug: slug });
    };
    
    incrementView();
  }, [slug]);

  return null;
}
