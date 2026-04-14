import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { dictionaries, isLocale } from "@/lib/i18n";
import { listProjects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const title = locale === "zh" ? "首页" : "Home";
  const description =
    locale === "zh"
      ? "项目展示与个人简历首页。"
      : "Homepage for project showcase and resume highlights.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}`,
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = dictionaries[locale];
  const featuredProjects = await listProjects(locale, true);

  return (
    <div className="space-y-8">
      <section className="section-card grid gap-8 px-7 py-8 md:grid-cols-[1.5fr_1fr] md:px-10 md:py-11">
        <div>
          <span className="inline-flex rounded-full bg-[#0f3d3e] px-3 py-1 text-xs font-semibold tracking-wide text-white">
            {dict.home.badge}
          </span>
          <h1 className="mt-5 max-w-2xl font-serif text-4xl leading-tight text-[#102628] md:text-5xl">
            {dict.home.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#425153]">{dict.home.intro}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/projects`}
              className="rounded-full bg-[#0f3d3e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2f31]"
            >
              {dict.home.ctaProjects}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="rounded-full border border-[#0f3d3e]/30 bg-white px-6 py-3 text-sm font-semibold text-[#0f3d3e] transition hover:border-[#0f3d3e]"
            >
              {dict.home.ctaContact}
            </Link>
          </div>
        </div>

        <div className="section-card grid gap-4 p-5 text-sm text-[#355154]">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#0f3d3e]/70">Focus</p>
            <p className="mt-1 font-semibold text-[#112426]">
              {locale === "zh" ? "AI Agent / 强化学习 / 多智能体协同" : "AI Agent / RL / Multi-Agent Collaboration"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#0f3d3e]/70">Stack</p>
            <p className="mt-1 font-semibold text-[#112426]">Python · C++ · PyTorch · ROS</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#0f3d3e]/70">Availability</p>
            <p className="mt-1 font-semibold text-[#112426]">
              {locale === "zh" ? "开放算法岗全职与实习机会" : "Open to full-time and internship opportunities"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-[#112426]">{dict.home.sectionTitle}</h2>
            <p className="mt-2 text-sm text-[#425153]">{dict.home.sectionDesc}</p>
          </div>
          <Link href={`/${locale}/projects`} className="text-sm font-semibold text-[#0f3d3e] hover:underline">
            {dict.home.viewAllProjects}
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {featuredProjects.map((project) => (
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
      </section>
    </div>
  );
}
