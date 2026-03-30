import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { listAllProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

const staticPaths = ["", "/projects", "/about", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((suffix) => {
      const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
        suffix === "" ? "weekly" : "monthly";

      return {
        url: `${siteConfig.siteUrl}/${locale}${suffix}`,
        lastModified: new Date(),
        changeFrequency,
        priority: suffix === "" ? 1 : 0.8,
      };
    }),
  );

  const projectRoutes = (await listAllProjects()).map((project) => ({
    url: `${siteConfig.siteUrl}/${project.locale}/projects/${project.slug}`,
    lastModified: new Date(project.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
