import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import {
  ReferralSummary,
  ReferralLeaderboardEntry,
  UserReferralAnalytics,
  TimeRange
} from '@/types/referral';

export function useReferralSummary(timeRange: '7d' | '30d' | '90d' = '30d') {
  return useQuery<ReferralSummary>({
    queryKey: ['referral-summary', timeRange],
    queryFn: () => apiClient(`/api/v1/admin/referral?timeRange=${timeRange}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
}

export function useReferralLeaderboard(weekOffset: number = 0, limit: number = 20) {
  return useQuery<ReferralLeaderboardEntry[]>({
    queryKey: ['referral-leaderboard', weekOffset, limit],
    queryFn: () => apiClient(`/api/v1/admin/referral/leaderboard?weekOffset=${weekOffset}&limit=${limit}`),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
    placeholderData: (previousData) => previousData, // Renamed from keepPreviousData
  });
}

export function useUserReferralAnalytics(userId: string) {
  return useQuery<UserReferralAnalytics>({
    queryKey: ['user-referral-analytics', userId],
    queryFn: () => apiClient(`/api/v1/admin/referral/${userId}`),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
}

export const TIME_RANGES: TimeRange[] = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 },
];

export function getTimeRangeData(timeRange: '7d' | '30d' | '90d', data: ReferralSummary) {
  const timeRangeObj = TIME_RANGES.find(tr => tr.value === timeRange);
  if (!timeRangeObj) return null;

  // Use daily data for 7d, weekly data for 30d and 90d
  return timeRange === '7d' ? data.daily_referrals : data.weekly_referrals;
}