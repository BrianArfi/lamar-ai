export type PlanTier = 'free' | 'starter' | 'pro' | 'tim'

export type ApplicationStatus =
  | 'Evaluated'
  | 'Applied'
  | 'Responded'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Discarded'
  | 'SKIP'

export type LegitimacyTier = 'High Confidence' | 'Proceed with Caution' | 'Suspicious'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  cv_markdown: string | null
  plan_tier: PlanTier
  evaluations_count: number
  created_at: string
  updated_at: string
}

export interface EvaluationBlock {
  score?: number
  summary?: string
  details?: string
  gaps?: string[]
  highlights?: string[]
}

export interface Evaluation {
  id: string
  user_id: string
  company: string | null
  role: string | null
  jd_url: string | null
  jd_text: string
  score: number | null
  legitimacy_tier: LegitimacyTier | null
  report_markdown: string | null
  status: ApplicationStatus
  created_at: string
}

export interface Application {
  id: string
  user_id: string
  evaluation_id: string | null
  company: string
  role: string
  score: number | null
  status: ApplicationStatus
  pdf_generated: boolean
  notes: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
}

export const PLAN_LIMITS: Record<PlanTier, { evaluations: number; cvs: number; scanner: boolean }> = {
  free:    { evaluations: 3,          cvs: 1,  scanner: false },
  starter: { evaluations: 20,         cvs: 1,  scanner: false },
  pro:     { evaluations: Infinity,   cvs: 3,  scanner: true  },
  tim:     { evaluations: Infinity,   cvs: 10, scanner: true  },
}
