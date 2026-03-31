export function getSafeRedirectUrl(nextUrl: string | null): string {
  // If no URL is provided, default to /dashboard
  if (!nextUrl) {
    return "/dashboard";
  }

  // Validate that the URL is a relative path starting with exactly one slash
  // It MUST NOT start with two slashes (e.g. "//example.com" which is protocol-relative)
  // It MUST NOT be an absolute URL (e.g. "https://example.com" or "javascript:alert(1)")
  if (nextUrl.startsWith("/") && !nextUrl.startsWith("//")) {
    return nextUrl;
  }

  // Fallback to safe default
  return "/dashboard";
}
