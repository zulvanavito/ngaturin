"use server";

import { createStaticClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBlogComment(
  prevState: any,
  formData: FormData
) {
  try {
    const postSlug = formData.get("postSlug") as string;
    const parentId = formData.get("parentId") as string | null;
    const guestName = formData.get("guestName") as string;
    const guestEmail = formData.get("guestEmail") as string;
    const content = formData.get("content") as string;

    if (!postSlug || !guestName || !guestEmail || !content) {
      return {
        error: "Harap isi semua kolom komentar.",
        success: false,
      };
    }

    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(guestEmail)) {
      return {
        error: "Format email tidak valid.",
        success: false,
      };
    }

    const supabase = createStaticClient();
    
    // Using static client because we allow anonymous inserts
    const { error } = await supabase
      .from("blog_comments")
      .insert([
        {
          post_slug: postSlug,
          parent_id: parentId || null,
          guest_name: guestName,
          guest_email: guestEmail,
          content: content,
        }
      ]);

    if (error) {
      console.error("Error adding comment:", error);
      return {
        error: "Terjadi kesalahan saat mengirim komentar. Silakan coba lagi.",
        success: false,
      };
    }

    // Revalidate the blog post page to show the new comment
    revalidatePath(`/blog/${postSlug}`);

    return {
      success: true,
      error: null,
    };
  } catch (err: any) {
    console.error("Unexpected error in addBlogComment:", err);
    return {
      error: "Terjadi kesalahan internal. Silakan coba lagi.",
      success: false,
    };
  }
}
