export type SubmissionStatus =
  | "queued"
  | "running"
  | "passed"
  | "failed"
  | "disqualified";

export interface Team {
  id: string;
  name: string;
  school: string;
  rank: number;
  pnl: number;
  sharpe: number;
  maxDrawdown: number;
  status: SubmissionStatus;
  submissionsCount: number;
  lastSubmitted: string;
  sparklineData: number[];
}

export interface Submission {
  id: number;
  teamId: string;
  teamName: string;
  school: string;
  fileName: string;
  timestamp: string;
  status: SubmissionStatus;
  score: number | null;
  pnl: number | null;
  sharpe: number | null;
  errorMessage?: string;
}

export interface TimelineEvent {
  id: string;
  phase: string;
  date: string;
  description: string;
  status: "completed" | "active" | "upcoming";
}

export interface AdminLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
  details?: string;
}

export interface Sponsor {
  name: string;
  tier: "gold" | "silver" | "bronze";
  logoPlaceholder: string;
}

export interface LeaderboardStats {
  totalTeams: number;
  totalSubmissions: number;
  topPnl: number;
  topSharpe: number;
  avgDrawdown: number;
  activePeriod: string;
}
