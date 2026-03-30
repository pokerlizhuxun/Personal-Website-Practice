import Link from "next/link";
import { formatProjectDate } from "@/lib/date";
import type { Locale, Project } from "@/types/content";

interface ProjectCardProps {
  locale: Locale;
  project: Project;
  viewDetailLabel: string;
  demoLabel: string;
  repoLabel: string;
}

export function ProjectCard({
  locale,
  project,
  viewDetailLabel,
  demoLabel,
  repoLabel,
}: ProjectCardProps) {
  return (
    <article className="group rounded-3xl border border-black/7 bg-white/90 p-6 shadow-[0_14px_30px_rgba(24,40,38,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(24,40,38,0.12)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-[#122f31]">{project.title}</h3>
        <span className="rounded-full bg-[#eff7f4] px-3 py-1 text-xs font-semibold text-[#0f3d3e]">
          {formatProjectDate(locale, project.date)}
        </span>
      </div>

      <p className="text-sm leading-7 text-[#425153]">{project.summary}</p>

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

      <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href={`/${locale}/projects/${project.slug}`} className="text-[#0f3d3e] hover:underline">
          {viewDetailLabel}
        </Link>
        {project.links.demo ? (
          <a href={project.links.demo} target="_blank" rel="noreferrer" className="text-[#14666a] hover:underline">
            {demoLabel}
          </a>
        ) : null}
        {project.links.repo ? (
          <a href={project.links.repo} target="_blank" rel="noreferrer" className="text-[#14666a] hover:underline">
            {repoLabel}
          </a>
        ) : null}
      </div>
    </article>
  );
}
