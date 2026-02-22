export interface Project {
  id: number;
  title: string;
  description: string;
  long_description?: string;
  technologies: string;
  github_url?: string;
  live_url?: string;
  image_url?: string;
  category: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  category: 'Web Security' | 'Pwn' | 'Bug Bounty' | 'Tooling' | 'CTF Writeup';
  readTime: string;
}
export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number; // 0-100
  icon?: string;
  created_at?: string;
}

export interface CTFEntry {
  id: number;
  competition_name: string;
  event_date: string;
  rank: number;
  team_name?: string;
  challenges_solved: number;
  total_challenges: number;
  points_earned: number;
  writeup_url?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface BugBountyEntry {
  id: number;
  program_name: string;
  vulnerability_type: string;
  severity: string;
  bounty_amount: number;
  report_date: string;
  status: string;
  description?: string;
  report_url?: string;
  created_at?: string;
}

export interface Certificate {
  id: number;
  rank: number;
  title: string;
  description: string;
  image_url?: string;
  issuing_organization: string;
  issue_date: string;
  skill_tags?: string;
  verification_link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Stat {
  label: string;
  value: string | number;
  icon?: any;
}