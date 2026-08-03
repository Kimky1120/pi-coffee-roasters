import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/constants/site";
import { COFFEE_BEANS } from "@/data/coffee";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_CONFIG.url}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...COFFEE_BEANS.map((bean) => ({
      url: `${SITE_CONFIG.url}/coffee/${bean.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
