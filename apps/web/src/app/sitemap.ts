import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

type Product = { slug: string; updatedAt?: string };
type Response = { data: Product[] };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/prodavnica", "/kategorije", "/o-nama"].map(
    (route) => ({
      url: `${env.appUrl}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }),
  );

  try {
    const response = await fetch(
      `${env.apiUrl}/products?limit=100&sortBy=createdAt&sortOrder=desc`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) return staticRoutes;
    const payload = (await response.json()) as Response;
    return [
      ...staticRoutes,
      ...payload.data.map((product) => ({
        url: `${env.appUrl}/prodavnica/${encodeURIComponent(product.slug)}`,
        lastModified: product.updatedAt
          ? new Date(product.updatedAt)
          : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
