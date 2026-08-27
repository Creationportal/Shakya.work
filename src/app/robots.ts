import type { MetadataRoute } from "next";

const BASE = "https://shakya.work";

/** robots.txt — private paths (/settings, /api, /cv, /vault) are never
 *  crawlable. /cv holds personal material and is meant to be reached only via
 *  direct link or the /vault passcode; /vault is the access gate for it. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/settings", "/api/", "/.data/", "/cv", "/vault"];
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow,
    },
  ];

  return {
    rules,
    sitemap: `${BASE}/sitemap.xml`,
  };
}
