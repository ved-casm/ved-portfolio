import type { MetadataRoute } from "next";
import { projects } from "@/components/projects/showcase/projectShowcaseData";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.9 },
    { path: "/works", priority: 0.9 },
    { path: "/services", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    ...projects.map((p) => ({ path: `/works/${p.slug}`, priority: 0.6 })),
  ];
  return pages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
