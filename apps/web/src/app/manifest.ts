import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pro Graft",
    short_name: "Pro Graft",
    description: "Online prodavnica ukrasnih biljaka i opreme za negu.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f6f0",
    theme_color: "#1f5039",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
