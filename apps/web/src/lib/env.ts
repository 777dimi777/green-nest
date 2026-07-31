const developmentApiUrl = "http://localhost:3001/api";
const developmentAppUrl = "http://localhost:3000";

function publicUrl(
  name: "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_APP_URL",
  configured: string | undefined,
  fallback: string,
) {
  const value = configured?.trim();
  if (value) {
    try {
      return new URL(value).toString().replace(/\/$/, "");
    } catch {
      throw new Error(`${name} mora biti validan apsolutni URL.`);
    }
  }
  if (process.env.NODE_ENV !== "production") return fallback;
  throw new Error(`Nedostaje obavezna production konfiguracija ${name}.`);
}

export const env = {
  apiUrl: publicUrl(
    "NEXT_PUBLIC_API_URL",
    process.env.NEXT_PUBLIC_API_URL,
    developmentApiUrl,
  ),
  appUrl: publicUrl(
    "NEXT_PUBLIC_APP_URL",
    process.env.NEXT_PUBLIC_APP_URL,
    developmentAppUrl,
  ),
} as const;
