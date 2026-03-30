import type { Locale } from "@/types/content";

export function formatProjectDate(locale: Locale, dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const language = locale === "zh" ? "zh-CN" : "en-US";

  return new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
  }).format(date);
}
