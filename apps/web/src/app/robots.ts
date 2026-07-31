import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/nalog",
        "/korpa",
        "/lista-zelja",
        "/checkout",
        "/porudzbine",
        "/adrese",
      ],
    },
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
