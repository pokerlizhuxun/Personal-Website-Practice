import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
import { profileByLocale } from "@/lib/profile";
import { siteConfig } from "@/lib/site";
import type { ProfileItem } from "@/types/content";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

type ResumeSectionProps = {
  title: string;
  items: ProfileItem[];
};

function ResumeSection({ title, items }: ResumeSectionProps) {
  return (
    <section className="section-card px-7 py-8 md:px-10">
      <h2 className="font-serif text-2xl text-[#112426]">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <article key={`${item.title}-${item.period}`} className="rounded-2xl border border-black/8 bg-white/70 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-[#112426]">{item.title}</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f3d3e]/70">
                {item.period}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#355154]">{item.subtitle}</p>
            {item.bullets.length > 0 ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[#425153]">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return {
    title: locale === "zh" ? "关于" : "About",
    description:
      locale === "zh" ? "个人简历、经历和技能栈。" : "Resume highlights, experience, and skills.",
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/about`,
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = dictionaries[locale];
  const profile = profileByLocale[locale];

  return (
    <div className="space-y-6">
      <section className="section-card px-7 py-8 md:px-10">
        <h1 className="font-serif text-4xl text-[#112426]">{dict.about.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[#425153]">{dict.about.description}</p>

        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-2xl border border-black/8 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#0f3d3e]/70">{dict.about.location}</p>
            <p className="mt-2 font-semibold text-[#112426]">{profile.location}</p>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#0f3d3e]/70">{dict.about.targetRole}</p>
            <p className="mt-2 font-semibold text-[#112426]">{profile.targetRole}</p>
          </div>
        </div>

        <p className="mt-6 text-base leading-8 text-[#425153]">{profile.bio}</p>
      </section>

      <ResumeSection title={dict.about.sectionEducation} items={profile.education} />
      <ResumeSection title={dict.about.sectionResearchProjects} items={profile.researchProjects} />
      <ResumeSection title={dict.about.sectionExperience} items={profile.experience} />

      <section className="grid gap-6 lg:grid-cols-2">
        <ResumeSection title={dict.about.sectionPublications} items={profile.publications} />
        <ResumeSection title={dict.about.sectionCompetitions} items={profile.competitions} />
      </section>

      <section className="section-card px-7 py-8 md:px-10">
        <h2 className="font-serif text-2xl text-[#112426]">{dict.about.sectionSkills}</h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[#0f3d3e]/15 bg-[#0f3d3e]/6 px-3 py-1.5 text-xs font-semibold text-[#145457]"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
