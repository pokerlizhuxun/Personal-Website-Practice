import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return {
    title: locale === "zh" ? "联系" : "Contact",
    description:
      locale === "zh"
        ? "通过邮箱与社媒渠道联系我。"
        : "Reach out through email and social channels.",
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/contact`,
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = dictionaries[locale];

  const contactItems = [
    {
      label: dict.contact.emailLabel,
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
    },
    {
      label: dict.contact.githubLabel,
      value: siteConfig.github,
      href: siteConfig.github,
    },
    {
      label: dict.contact.linkedinLabel,
      value: siteConfig.linkedin,
      href: siteConfig.linkedin,
    },
  ].filter((item) => item.value && item.href);

  return (
    <section className="section-card px-7 py-8 md:px-10 md:py-10">
      <h1 className="font-serif text-4xl text-[#112426]">{dict.contact.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[#425153]">{dict.contact.description}</p>

      <div className="mt-8 grid gap-4">
        {contactItems.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-black/8 bg-white/75 p-5 transition hover:border-[#0f3d3e]/30"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f3d3e]/70">{item.label}</p>
            <a
              href={item.href}
              target={item.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
              className="mt-2 block break-all text-base font-semibold text-[#0f3d3e] hover:underline"
            >
              {item.value}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
