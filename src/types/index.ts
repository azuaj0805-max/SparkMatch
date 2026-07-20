export type Profile = {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  age: number
  city: string
  bio: string | null
  photos: string[]
  job_title: string | null
  company: string | null
  industry: string | null
  salary_range: SalaryRange | null
  total_comp: string | null
  work_style: string[]
  last_active: string | null
  elo_score: number
  is_boosted: boolean
  boost_expires_at: string | null
  lat: number | null
  lng: number | null
  five_year_goal: string | null
  salary_verified: boolean
  gender: string | null
  orientation: string[]
  show_orientation: boolean
  looking_for: LookingFor | null
  relationship_style: string[]
  interested_in: string[]
  min_partner_salary: number
  has_kids: string | null
  wants_kids: string | null
  drinking: string | null
  smoking: string | null
  religion: string | null
  prompts: Prompt[]
}

export type Prompt = {
  question: string
  answer: string
}

export type Like = {
  id: string
  created_at: string
  liker_id: string
  liked_id: string
  message: string | null
  passed: boolean
}

export type Match = {
  id: string
  created_at: string
  user1_id: string
  user2_id: string
  last_message: string | null
  last_message_at: string | null
  other_user?: Profile
}

export type Message = {
  id: string
  created_at: string
  match_id: string
  sender_id: string
  content: string
  read: boolean
  read_at: string | null
}

export type SalaryRange =
  | 'under_40k'
  | '40_60k'
  | '60_80k'
  | '80_100k'
  | '100_150k'
  | '150_200k'
  | '200k_plus'

export const SALARY_LABELS: Record<SalaryRange, string> = {
  under_40k:  'Under $40,000',
  '40_60k':   '$40,000 – $60,000',
  '60_80k':   '$60,000 – $80,000',
  '80_100k':  '$80,000 – $100,000',
  '100_150k': '$100,000 – $150,000',
  '150_200k': '$150,000 – $200,000',
  '200k_plus':'$200,000+',
}

export const SALARY_BADGE_LABELS: Record<SalaryRange, string> = {
  under_40k:  '<$40k',
  '40_60k':   '$40–60k',
  '60_80k':   '$60–80k',
  '80_100k':  '$80–100k',
  '100_150k': '$100–150k',
  '150_200k': '$150–200k',
  '200k_plus':'$200k+',
}

export type LookingFor =
  | 'serious'
  | 'open'
  | 'casual'
  | 'friends'
  | 'private'

export const LOOKING_FOR_LABELS: Record<LookingFor, string> = {
  serious:  'Something serious',
  open:     'Open to anything',
  casual:   'Casual dating',
  friends:  'New friends',
  private:  'Prefer not to say',
}
