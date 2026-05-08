export function getSafeRedirectUrl(nextUrl: string | null): string {
  // If no URL is provided, default to /
  if (!nextUrl) {
    return "/";
  }

  // Validate that the URL is a relative path starting with exactly one slash
  if (nextUrl.startsWith("/") && !nextUrl.startsWith("//")) {
    return nextUrl;
  }

  // Fallback to safe default
  return "/";
}
