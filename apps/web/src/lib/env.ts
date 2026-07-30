const developmentApiUrl = "http://localhost:3001/api";

function getPublicApiUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).toString().replace(/\/$/, "");
    } catch {
      throw new Error("NEXT_PUBLIC_API_URL mora biti validan apsolutni URL.");
    }
  }
  if (process.env.NODE_ENV !== "production") return developmentApiUrl;
  throw new Error("Nedostaje obavezna konfiguracija NEXT_PUBLIC_API_URL.");
}

export const env = { apiUrl: getPublicApiUrl() } as const;
