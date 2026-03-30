import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
import { getProjectBySlug, listAllProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const projects = await listAllProjects();

  return projects.map((project) => ({
    locale: project.locale,
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const projects = await listAllProjects();
  const project = projects.find((item) => item.locale === locale && item.slug === slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/projects/${slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = dictionaries[locale];
  const result = await getProjectBySlug(locale, slug);

  if (!result) {
    notFound();
  }

  const { project, content } = result;

  return (
    <div className="space-y-5">
      <Link href={`/${locale}/projects`} className="inline-flex text-sm font-semibold text-[#0f3d3e] hover:underline">
        {dict.projects.back}
      </Link>

      <article className="section-card px-7 py-8 md:px-10">
        <div className="mb-6 border-b border-black/8 pb-6">
          <h1 className="font-serif text-4xl text-[#112426]">{project.title}</h1>
          <p className="mt-3 text-base leading-8 text-[#425153]">{project.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={`${project.slug}-${tech}`}
                className="rounded-full border border-[#0f3d3e]/12 bg-[#0f3d3e]/4 px-2.5 py-1 text-xs font-medium text-[#145457]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mdx-content">{content}</div>
      </article>
    </div>
  );
}
