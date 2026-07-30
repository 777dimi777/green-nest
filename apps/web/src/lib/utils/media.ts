import { env } from "@/lib/env";

export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  try {
    return new URL(path).toString();
  } catch {
    if (!path.startsWith("/uploads")) return null;
    const apiUrl = new URL(env.apiUrl);
    return new URL(path, apiUrl.origin).toString();
  }
}
