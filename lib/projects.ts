import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { isLocale } from "@/lib/i18n";
import type { Locale, Project, ProjectLinks } from "@/types/content";

const projectsDir = path.join(process.cwd(), "content", "projects");

type ProjectEntry = {
  filePath: string;
  rawSource: string;
  project: Project;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toLinks(value: unknown): ProjectLinks {
  if (!value || typeof value !== "object") {
    return {};
  }

  const record = value as Record<string, unknown>;

  return {
    demo: typeof record.demo === "string" ? record.demo : undefined,
    repo: typeof record.repo === "string" ? record.repo : undefined,
  };
}

function normalizeProject(
  frontmatter: Record<string, unknown>,
  fallbackSlug: string,
): Project | null {
  const localeRaw = typeof frontmatter.locale === "string" ? frontmatter.locale : "";

  if (!isLocale(localeRaw)) {
    return null;
  }

  const title = typeof frontmatter.title === "string" ? frontmatter.title.trim() : "";
  const summary = typeof frontmatter.summary === "string" ? frontmatter.summary.trim() : "";

  if (!title || !summary) {
    return null;
  }

  const slug =
    typeof frontmatter.slug === "string" && frontmatter.slug.trim()
      ? frontmatter.slug.trim()
      : fallbackSlug;

  const date =
    typeof frontmatter.date === "string" && frontmatter.date.trim()
      ? frontmatter.date.trim()
      : "1970-01-01";

  return {
    slug,
    locale: localeRaw,
    title,
    summary,
    date,
    stack: toStringArray(frontmatter.stack),
    links: toLinks(frontmatter.links),
    featured: Boolean(frontmatter.featured),
  };
}

const loadProjectEntries = cache(async (): Promise<ProjectEntry[]> => {
  let filenames: string[];

  try {
    filenames = await fs.readdir(projectsDir);
  } catch {
    return [];
  }

  const mdxFiles = filenames.filter((filename) => filename.endsWith(".mdx"));

  const entries = await Promise.all(
    mdxFiles.map(async (filename): Promise<ProjectEntry | null> => {
      const filePath = path.join(projectsDir, filename);
      const rawSource = await fs.readFile(filePath, "utf-8");
      const fallbackSlug = filename.replace(/\.mdx$/, "").replace(/\.(zh|en)$/, "");
      const { data } = matter(rawSource);
      const project = normalizeProject(data, fallbackSlug);

      if (!project) {
        return null;
      }

      return { filePath, rawSource, project };
    }),
  );

  return entries
    .filter((entry): entry is ProjectEntry => entry !== null)
    .sort((a, b) => Date.parse(b.project.date) - Date.parse(a.project.date));
});

export async function listAllProjects(): Promise<Project[]> {
  const entries = await loadProjectEntries();
  return entries.map((entry) => entry.project);
}

export async function listProjects(locale: Locale, featuredOnly = false): Promise<Project[]> {
  const projects = await listAllProjects();

  return projects.filter((project) => {
    if (project.locale !== locale) {
      return false;
    }

    return featuredOnly ? project.featured : true;
  });
}

export async function getProjectBySlug(locale: Locale, slug: string) {
  const entries = await loadProjectEntries();
  const matched = entries.find((entry) => entry.project.locale === locale && entry.project.slug === slug);

  if (!matched) {
    return null;
  }

  const rendered = await compileMDX<Record<string, unknown>>({
    source: matched.rawSource,
    options: {
      parseFrontmatter: true,
    },
  });

  return {
    project: matched.project,
    content: rendered.content,
  };
}
