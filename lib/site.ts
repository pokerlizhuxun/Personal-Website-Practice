function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return "https://personal-website-practice.vercel.app";
  }

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return parsed.origin;
  } catch {
    return "https://personal-website-practice.vercel.app";
  }
}

export const siteConfig = {
  ownerName: process.env.NEXT_PUBLIC_OWNER_NAME?.trim() || "李筑勋",
  ownerTitleZh:
    process.env.NEXT_PUBLIC_OWNER_TITLE_ZH?.trim() || "AI Agent / 强化学习 / 多智能体协同",
  ownerTitleEn:
    process.env.NEXT_PUBLIC_OWNER_TITLE_EN?.trim() ||
    "AI Agent, Reinforcement Learning, Multi-Agent Collaboration",
  siteUrl: normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL || "https://personal-website-practice.vercel.app",
  ),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "zhuxun_li@163.com",
  github: process.env.NEXT_PUBLIC_GITHUB_URL?.trim() || "https://github.com/pokerlizhuxun",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() || "",
};
