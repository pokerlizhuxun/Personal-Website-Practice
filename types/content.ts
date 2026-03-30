export type Locale = "zh" | "en";

export interface ProjectLinks {
  demo?: string;
  repo?: string;
}

export interface Project {
  slug: string;
  locale: Locale;
  title: string;
  summary: string;
  date: string;
  stack: string[];
  links: ProjectLinks;
  featured: boolean;
}

export interface ProfileItem {
  title: string;
  subtitle: string;
  period: string;
  bullets: string[];
}

export interface ProfileResume {
  bio: string;
  location: string;
  targetRole: string;
  education: ProfileItem[];
  researchProjects: ProfileItem[];
  experience: ProfileItem[];
  publications: ProfileItem[];
  competitions: ProfileItem[];
  skills: string[];
  contact: {
    email: string;
    github: string;
    linkedin: string;
  };
}
