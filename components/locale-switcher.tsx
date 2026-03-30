"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/lib/i18n";
import type { Locale } from "@/types/content";

function swapLocaleInPath(pathname: string, target: Locale): string {
  if (!pathname) {
    return `/${target}`;
  }

  if (pathname === "/") {
    return `/${target}`;
  }

  if (pathname.startsWith("/zh/") || pathname === "/zh") {
    return pathname.replace(/^\/zh/, `/${target}`);
  }

  if (pathname.startsWith("/en/") || pathname === "/en") {
    return pathname.replace(/^\/en/, `/${target}`);
  }

  return `/${target}${pathname}`;
}

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/80 p-1">
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={swapLocaleInPath(pathname, locale)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              isActive
                ? "bg-[#0f3d3e] text-white"
                : "text-[#0f3d3e] hover:bg-[#0f3d3e]/10"
            }`}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
