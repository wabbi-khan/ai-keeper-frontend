'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pitchService } from '@/services/pitch.service';
import { Pitch, PitchStatus } from '@/types/deal';
import { useDebounce } from './useDebounce';
import { toast } from 'sonner';

export interface DashboardPitchesFilter {
  status?: string;
  search?: string;
  page?: number;
  slug?: string;
  sector?: string;
  debounceMs?: number;
}

export const dashboardPitchKeys = {
  all: ['dashboard-pitches'] as const,
  list: (filters: DashboardPitchesFilter) =>
    ['dashboard-pitches', { slug: filters.slug, status: filters.status, search: filters.search, page: filters.page }] as const,
};

/**
 * Custom TanStack Query hook to fetch pitches for the investor dashboard.
 * Supports configurable search input debouncing (e.g. 400ms) to prevent high-frequency API calls.
 *
 * Query key: ['dashboard-pitches', { slug, status, search, page }]
 */
export function useDashboardPitches(filters: DashboardPitchesFilter = {}) {
  const {
    status,
    search: rawSearch,
    page,
    slug: explicitSlug,
    sector,
    debounceMs = 400,
  } = filters;

  const resolvedSlug =
    explicitSlug ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('dealflow_thesis_slug') || undefined
      : undefined);

  // Debounce search query so API calls to /api/pitches?search=... wait until typing pauses
  const debouncedSearch = useDebounce(rawSearch, debounceMs);
  const effectiveSearch = debounceMs > 0 ? debouncedSearch : rawSearch;
  const normalizedSearch = effectiveSearch?.trim() ? effectiveSearch.trim() : undefined;

  return useQuery<Pitch[], Error>({
    queryKey: ['dashboard-pitches', { slug: resolvedSlug, status, search: normalizedSearch, page }],
    queryFn: async () => {
      return await pitchService.getPitches({
        slug: resolvedSlug,
        status: status && status !== 'ALL' ? status : undefined,
        search: normalizedSearch,
        page,
        sector,
      });
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Mutation hook to update pitch triage status (TOP_1_PERCENT, REVIEW, REJECTED)
 */
export function useUpdatePitchStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Pitch,
    Error,
    { pitchId: string; status: PitchStatus; startupName?: string }
  >({
    mutationFn: async ({ pitchId, status }) => {
      return await pitchService.updatePitchStatus(pitchId, status);
    },
    onSuccess: (updatedPitch, variables) => {
      queryClient.invalidateQueries({ queryKey: dashboardPitchKeys.all });
      toast.success(
        `Pitch status updated to ${variables.status.replace(/_/g, ' ')}`,
        {
          description: variables.startupName
            ? `${variables.startupName} updated successfully.`
            : undefined,
        }
      );
    },
    onError: (error: any) => {
      toast.error('Failed to update pitch status', {
        description: error?.message || 'Please check your permissions.',
      });
    },
  });
}

export default useDashboardPitches;
