export interface ReferralSummary {
  total_referrals: number;
  total_referrers: number;
  average_referrals_per_referrer: number;
  daily_referrals: Array<{
    date: string;
    count: number;
  }>;
  weekly_referrals: Array<{
    week: string;
    count: number;
  }>;
}

export interface ReferralLeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  referral_count: number;
  recent_referrals: number;
  rank: number;
  created_at: string;
}

export interface ReferralStat {
  id: string;
  display_name: string;
  username: string;
  avatar: string | null;
  created_at: string;
}

export interface UserReferralAnalytics {
  user: {
    id: string;
    display_name: string;
    username: string;
    avatar: string | null;
    email: string;
    referral_code: string;
    created_at: string;
  };
  referral_stats: {
    total_referrals: number;
    referral_conversion_rate: number;
    recent_referrals: ReferralStat[];
  };
  monthly_referrals: Array<{
    month: string;
    count: number;
  }>;
}

export interface TimeRange {
  label: string;
  value: '7d' | '30d' | '90d';
  days: number;
}

export interface ReferralError {
  message: string;
  code?: string;
}