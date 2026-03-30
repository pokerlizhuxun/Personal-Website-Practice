import type { Locale } from "@/types/content";

export const locales = ["zh", "en"] as const;
export const defaultLocale: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export interface SiteDictionary {
  localeName: string;
  switchTo: string;
  nav: {
    home: string;
    projects: string;
    about: string;
    contact: string;
  };
  home: {
    badge: string;
    headline: string;
    intro: string;
    ctaProjects: string;
    ctaContact: string;
    sectionTitle: string;
    sectionDesc: string;
    viewAllProjects: string;
  };
  projects: {
    title: string;
    description: string;
    empty: string;
    back: string;
    viewDetail: string;
    demo: string;
    repo: string;
  };
  about: {
    title: string;
    description: string;
    location: string;
    targetRole: string;
    sectionEducation: string;
    sectionResearchProjects: string;
    sectionExperience: string;
    sectionPublications: string;
    sectionCompetitions: string;
    sectionSkills: string;
  };
  contact: {
    title: string;
    description: string;
    emailLabel: string;
    githubLabel: string;
    linkedinLabel: string;
  };
  footer: string;
}

export const dictionaries: Record<Locale, SiteDictionary> = {
  zh: {
    localeName: "中文",
    switchTo: "EN",
    nav: {
      home: "首页",
      projects: "项目",
      about: "关于",
      contact: "联系",
    },
    home: {
      badge: "北京航空航天大学 · 电子信息硕士 · AI Agent 方向",
      headline: "李筑勋｜AI Agent 与多智能体协同算法",
      intro:
        "我聚焦强化学习、多智能体协同与无人系统任务规划，兼顾算法研究与工程落地。这个网站用于公开展示我的核心项目、实习经历和学术成果。",
      ctaProjects: "查看项目",
      ctaContact: "联系我",
      sectionTitle: "代表项目",
      sectionDesc: "聚焦任务规划、协同控制与智能决策的项目实践。",
      viewAllProjects: "查看全部项目",
    },
    projects: {
      title: "项目展示",
      description: "按真实交付视角整理：问题定义、方案设计、技术实现与结果复盘。",
      empty: "当前语言下暂无项目，稍后会补充更多内容。",
      back: "返回项目列表",
      viewDetail: "查看详情",
      demo: "在线预览",
      repo: "代码仓库",
    },
    about: {
      title: "关于我 / 简历",
      description: "北京航空航天大学电子信息硕士，研究方向为强化学习与多智能体协同控制。",
      location: "所在城市",
      targetRole: "目标岗位",
      sectionEducation: "教育",
      sectionResearchProjects: "科研项目",
      sectionExperience: "实习与实践",
      sectionPublications: "学术成果",
      sectionCompetitions: "竞赛经历",
      sectionSkills: "技能栈",
    },
    contact: {
      title: "联系我",
      description: "欢迎交流全职机会、外包合作、开源项目与产品共创。",
      emailLabel: "邮箱",
      githubLabel: "GitHub",
      linkedinLabel: "LinkedIn",
    },
    footer: "长期主义，持续迭代。",
  },
  en: {
    localeName: "English",
    switchTo: "中文",
    nav: {
      home: "Home",
      projects: "Projects",
      about: "About",
      contact: "Contact",
    },
    home: {
      badge: "Beihang University · M.Eng. in Electronic Information · AI Agent Track",
      headline: "Zhuxun Li | AI Agent & Multi-Agent Collaboration",
      intro:
        "My work focuses on reinforcement learning, multi-agent collaboration, and autonomous mission planning, with a strong emphasis on research-to-production impact.",
      ctaProjects: "View Projects",
      ctaContact: "Get in Touch",
      sectionTitle: "Selected Projects",
      sectionDesc: "Projects focused on mission planning, collaborative control, and intelligent decision-making.",
      viewAllProjects: "Browse all projects",
    },
    projects: {
      title: "Project Showcase",
      description:
        "Each project is documented through problem framing, technical execution, and outcome review.",
      empty: "No projects yet in this locale. More updates coming soon.",
      back: "Back to projects",
      viewDetail: "Read case study",
      demo: "Live Demo",
      repo: "Repository",
    },
    about: {
      title: "About / Resume",
      description:
        "Master's student in Electronic Information at Beihang University, focusing on reinforcement learning and multi-agent collaborative control.",
      location: "Location",
      targetRole: "Target Role",
      sectionEducation: "Education",
      sectionResearchProjects: "Research Projects",
      sectionExperience: "Internships & Practice",
      sectionPublications: "Publications",
      sectionCompetitions: "Competitions",
      sectionSkills: "Skills",
    },
    contact: {
      title: "Contact",
      description: "Happy to discuss full-time roles, freelance work, and collaborative builds.",
      emailLabel: "Email",
      githubLabel: "GitHub",
      linkedinLabel: "LinkedIn",
    },
    footer: "Long-term thinking, continuous iteration.",
  },
};
