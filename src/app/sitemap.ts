import type { MetadataRoute } from "next";

const BASE = "https://shakya.work";

/**
 * sitemap.xml — public routes only. Private routes (/settings, /cv, /vault)
 * are deliberately excluded.
 */
const PUBLIC_ROUTES: { path: string; priority?: number; changeFrequency?: string }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8 },
  { path: "/ailab", priority: 0.8 },
  { path: "/ailab/ai-rnd", priority: 0.6 },
  { path: "/ailab/projects", priority: 0.7 },
  { path: "/ailab/agents", priority: 0.6 },
  { path: "/ailab/demos", priority: 0.7 },
  { path: "/ailab/simulation", priority: 0.7 },
  { path: "/projects", priority: 0.8 },
  { path: "/wt", priority: 0.6 },
  { path: "/trading", priority: 0.7 },
  { path: "/ideas", priority: 0.8 },
  { path: "/skills", priority: 0.6 },
  { path: "/hub", priority: 0.5 },
  { path: "/contact", priority: 0.8 },
  { path: "/contact/vip", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/accessibility", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: r.priority,
  }));
}
