import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { dictionaries, isLocale } from "@/lib/i18n";
import { listProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return {
    title: locale === "zh" ? "项目" : "Projects",
    description:
      locale === "zh" ? "项目列表与案例详情。" : "Project list and technical case studies.",
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/projects`,
    },
  };
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = dictionaries[locale];
  const projects = await listProjects(locale);

  return (
    <div className="space-y-6">
      <section className="section-card px-7 py-8 md:px-10">
        <h1 className="font-serif text-4xl text-[#112426]">{dict.projects.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[#425153]">{dict.projects.description}</p>
      </section>

      {projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={`${project.locale}-${project.slug}`}
              locale={locale}
              project={project}
              viewDetailLabel={dict.projects.viewDetail}
              demoLabel={dict.projects.demo}
              repoLabel={dict.projects.repo}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-black/15 bg-white/70 p-5 text-sm text-[#425153]">
          {dict.projects.empty}
        </p>
      )}
    </div>
  );
}
