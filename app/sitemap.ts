import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/dal";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base routes
  const routes = ["", "/blog", "/pricing", "/contact", "/privacy-policy", "/terms-of-service", "/refund-policy"].map(
    (route) => ({
      url: `${defaultUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  try {
    // Dynamic blog posts routes
    const posts = await getBlogPosts();
    const blogRoutes = posts.map((post) => ({
      url: `${defaultUrl}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...routes, ...blogRoutes];
  } catch (error) {
    console.error("Error generating sitemap for blog posts:", error);
    return routes;
  }
}
