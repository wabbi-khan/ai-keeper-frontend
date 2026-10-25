'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { thesisService } from '@/services/thesis.service';
import { pitchService } from '@/services/pitch.service';
import { InvestorThesis, Pitch } from '@/types/deal';
import { PitchSubmissionValues } from '@/lib/validations/deal';

/**
 * TanStack Query Hook to fetch public thesis details by slug
 * Query key: ['public-thesis', slug]
 */
export function usePublicThesis(slug: string) {
  return useQuery<InvestorThesis, Error>({
    queryKey: ['public-thesis', slug],
    queryFn: async () => {
      return await thesisService.getPublicThesis(slug);
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  });
}

/**
 * TanStack Mutation Hook to submit a founder pitch deck
 * Calls pitchService.submitPitch(slug, payload)
 * Returns mutation state (mutateAsync, isPending, isSuccess, data, error)
 */
export function useSubmitPitchMutation(slug: string) {
  return useMutation<Pitch, Error, PitchSubmissionValues | FormData>({
    mutationFn: async (payload: PitchSubmissionValues | FormData) => {
      return await pitchService.submitPitch(slug, payload);
    },
  });
}
