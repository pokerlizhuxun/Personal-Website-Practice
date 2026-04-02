const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return FALLBACK_SITE_URL;
  }

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return parsed.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

function resolveSiteUrl(): string {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      FALLBACK_SITE_URL,
  );
}

export const siteConfig = {
  ownerName: process.env.NEXT_PUBLIC_OWNER_NAME?.trim() || "李筑勋",
  ownerTitleZh:
    process.env.NEXT_PUBLIC_OWNER_TITLE_ZH?.trim() || "AI Agent / 强化学习 / 多智能体协同",
  ownerTitleEn:
    process.env.NEXT_PUBLIC_OWNER_TITLE_EN?.trim() ||
    "AI Agent, Reinforcement Learning, Multi-Agent Collaboration",
  siteUrl: resolveSiteUrl(),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "zhuxun_li@163.com",
  github: process.env.NEXT_PUBLIC_GITHUB_URL?.trim() || "https://github.com/pokerlizhuxun",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() || "",
};
