import Link from "next/link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import type { SiteDictionary } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import type { Locale } from "@/types/content";

interface SiteShellProps {
  locale: Locale;
  dictionary: SiteDictionary;
  children: React.ReactNode;
}

export function SiteShell({ locale, dictionary, children }: SiteShellProps) {
  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/projects`, label: dictionary.nav.projects },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(244,173,77,0.18),transparent_40%),radial-gradient(circle_at_80%_8%,rgba(15,61,62,0.16),transparent_42%),radial-gradient(circle_at_60%_70%,rgba(12,137,115,0.12),transparent_36%)]" />
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href={`/${locale}`} className="flex flex-col leading-none">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0f3d3e]">
              {siteConfig.ownerName}
            </span>
            <span className="mt-1 text-xs text-[#4d5759]">
              {locale === "zh" ? siteConfig.ownerTitleZh : siteConfig.ownerTitleEn}
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium text-[#2a2f30] md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[#0f3d3e]">
                {item.label}
              </Link>
            ))}
          </nav>

          <LocaleSwitcher currentLocale={locale} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-10">{children}</main>

      <footer className="mt-12 border-t border-black/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-[#4d5759] sm:flex-row sm:items-center sm:justify-between">
          <span>{dictionary.footer}</span>
          <span>{new Date().getFullYear()} {siteConfig.ownerName}</span>
        </div>
      </footer>
    </div>
  );
}
