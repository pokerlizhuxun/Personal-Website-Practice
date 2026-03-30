import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { dictionaries, isLocale, locales } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const isChinese = locale === "zh";

  return {
    title: isChinese ? "个人网站" : "Portfolio",
    description: isChinese
      ? "用于项目发布与个人简历展示的双语网站。"
      : "Bilingual website for project case studies and resume presentation.",
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}`,
      languages: {
        zh: `${siteConfig.siteUrl}/zh`,
        en: `${siteConfig.siteUrl}/en`,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <SiteShell locale={locale} dictionary={dictionaries[locale]}>
      <div className="w-full">{children}</div>
    </SiteShell>
  );
}
