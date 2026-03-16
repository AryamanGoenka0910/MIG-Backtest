export type SubmissionStatus =
  | "queued"
  | "running"
  | "passed"
  | "failed_runtime"
  | "timed_out";

export type SubmissionScore = {
  pnl: number;
  sharpe: number;
  max_drawdown: number;
  scored_at: string;
};

export type Submission = {
  id: number;
  user_id: string;
  team_id: string;
  filename: string;
  status: SubmissionStatus;
  validation_error: string | null;
  runtime_seconds: number | null;
  created_at: string;
  updated_at: string;
  score: SubmissionScore | null;
};

export type DailyCountResponse = {
  user_id: string;
  count: number;
  limit: number;
};
