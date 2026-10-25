'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pitch, InvestorThesis } from '@/types/deal';
import { PitchSubmissionValues } from '@/lib/validations/deal';
import {
  fetchMockPitches,
  fetchMockThesis,
  updateMockPitchStatus,
  bulkUpdateMockPitchStatus,
  updateMockThesis,
  createMockPitch,
  getThesisBySlug,
  mockThesis,
} from '@/lib/mock-data';
import { toast } from 'sonner';
import { thesisService } from '@/services/thesis.service';

export const dealQueryKeys = {
  pitches: ['pitches'] as const,
  pitchDetail: (id: string) => ['pitches', id] as const,
  thesis: (slug: string) => ['thesis', slug] as const,
};

/**
 * Hook to fetch all inbound pitches
 */
export function usePitchesQuery() {
  return useQuery({
    queryKey: dealQueryKeys.pitches,
    queryFn: async () => {
      return await fetchMockPitches();
    },
  });
}

/**
 * Hook to fetch an investor's mandate thesis
 */
export function useThesisQuery(slug?: string) {
  const resolvedSlug =
    slug ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('dealflow_thesis_slug') || ''
      : '');

  return useQuery({
    queryKey: dealQueryKeys.thesis(resolvedSlug),
    queryFn: async () => {
      if (!resolvedSlug) return await fetchMockThesis();
      try {
        return await thesisService.getPublicThesis(resolvedSlug);
      } catch (err) {
        return await fetchMockThesis(resolvedSlug);
      }
    },
  });
}

/**
 * Hook to update an investor's thesis mandate
 */
export function useUpdateThesisMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updated: InvestorThesis) => {
      return await updateMockThesis(updated);
    },
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: dealQueryKeys.thesis(updated.slug) });
      const previousThesis = queryClient.getQueryData<InvestorThesis>(dealQueryKeys.thesis(updated.slug));
      queryClient.setQueryData(dealQueryKeys.thesis(updated.slug), updated);
      return { previousThesis };
    },
    onError: (err, variables, context) => {
      if (context?.previousThesis) {
        queryClient.setQueryData(dealQueryKeys.thesis(variables.slug), context.previousThesis);
      }
      toast.error('Failed to update investment thesis', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    },
    onSuccess: (data) => {
      toast.success('Investment Thesis Mandate Saved', {
        description: `Autonomous gatekeeper scoring parameters updated for ${data.firmName}.`,
        duration: 4000,
      });
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: dealQueryKeys.thesis(data.slug) });
      }
    },
  });
}

/**
 * Hook to update a single pitch status with optimistic UI updates
 */
export function useUpdatePitchStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pitchId,
      status,
      startupName,
    }: {
      pitchId: string;
      status: Pitch['status'];
      startupName?: string;
    }) => {
      return await updateMockPitchStatus(pitchId, status);
    },
    // Optimistic Update
    onMutate: async ({ pitchId, status }) => {
      await queryClient.cancelQueries({ queryKey: dealQueryKeys.pitches });

      const previousPitches = queryClient.getQueryData<Pitch[]>(dealQueryKeys.pitches);

      if (previousPitches) {
        queryClient.setQueryData<Pitch[]>(
          dealQueryKeys.pitches,
          previousPitches.map((p) =>
            p.id === pitchId ? { ...p, status } : p
          )
        );
      }

      return { previousPitches };
    },
    onError: (err, variables, context) => {
      if (context?.previousPitches) {
        queryClient.setQueryData(dealQueryKeys.pitches, context.previousPitches);
      }
      toast.error('Failed to update deal status', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    },
    onSuccess: (data, variables) => {
      const isRejected = variables.status === 'REJECTED';
      const isTopMatch = variables.status === 'TOP_1_PERCENT';

      if (isRejected) {
        toast.error(`Passed on ${variables.startupName || data.startupName}`, {
          description: 'Automated thesis non-alignment logged to audit ledger.',
          duration: 4000,
        });
      } else if (isTopMatch) {
        toast.success(`Promoted ${variables.startupName || data.startupName} to Top 1%`, {
          description: 'Queued for expedited Investment Committee review.',
          duration: 4000,
        });
      } else {
        toast.info(`Moved ${variables.startupName || data.startupName} to Review`, {
          description: 'Awaiting secondary analyst evaluation.',
          duration: 4000,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dealQueryKeys.pitches });
    },
  });
}

/**
 * Hook for bulk updating multiple pitch statuses with optimistic updates
 */
export function useBulkUpdatePitchStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pitchIds,
      status,
    }: {
      pitchIds: string[];
      status: Pitch['status'];
    }) => {
      return await bulkUpdateMockPitchStatus(pitchIds, status);
    },
    onMutate: async ({ pitchIds, status }) => {
      await queryClient.cancelQueries({ queryKey: dealQueryKeys.pitches });

      const previousPitches = queryClient.getQueryData<Pitch[]>(dealQueryKeys.pitches);

      if (previousPitches) {
        const idSet = new Set(pitchIds);
        queryClient.setQueryData<Pitch[]>(
          dealQueryKeys.pitches,
          previousPitches.map((p) =>
            idSet.has(p.id) ? { ...p, status } : p
          )
        );
      }

      return { previousPitches };
    },
    onError: (err, variables, context) => {
      if (context?.previousPitches) {
        queryClient.setQueryData(dealQueryKeys.pitches, context.previousPitches);
      }
      toast.error('Bulk update failed', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    },
    onSuccess: (data, variables) => {
      const count = variables.pitchIds.length;
      if (variables.status === 'REJECTED') {
        toast.error(`Bulk Passed on ${count} Deal${count === 1 ? '' : 's'}`, {
          description: 'Logged thesis divergence into audit trail.',
          duration: 4000,
        });
      } else {
        toast.success(`Updated status for ${count} Deal${count === 1 ? '' : 's'}`, {
          duration: 4000,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dealQueryKeys.pitches });
    },
  });
}

/**
 * Hook to submit a founder pitch and simulate AI Gatekeeper screening against active thesis
 */
export function useSubmitPitchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      values,
      thesisSlug: explicitSlug,
    }: {
      values: PitchSubmissionValues;
      thesisSlug?: string;
    }) => {
      const activeSlug =
        explicitSlug ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('dealflow_thesis_slug') || ''
          : '');

      // 1. Resolve active thesis for the tenant
      const activeThesis: InvestorThesis =
        queryClient.getQueryData<InvestorThesis>(dealQueryKeys.thesis(activeSlug)) ||
        getThesisBySlug(activeSlug) ||
        mockThesis;

      // 2. Simulate AI Gatekeeper Analysis
      let score = 70;
      const pros: string[] = [];
      const cons: string[] = [];
      const redFlags: string[] = [];

      // Sector matching
      const sectorMatches = activeThesis.targetSectors.some(
        (sec) =>
          sec.toLowerCase().includes(values.sector.toLowerCase()) ||
          values.sector.toLowerCase().includes(sec.toLowerCase())
      );

      if (sectorMatches) {
        score += 14;
        pros.push(`Direct thesis mandate fit: Operates within targeted ${values.sector} vertical.`);
      } else {
        score -= 22;
        cons.push(`Sector non-alignment: ${values.sector} is outside primary mandate focus.`);
      }

      // Financial Hurdle: MRR
      if (values.reportedMrr >= activeThesis.minMonthlyRev) {
        score += 12;
        pros.push(
          `Solid monetization: Reported MRR of $${values.reportedMrr.toLocaleString()}/mo exceeds minimum hurdle ($${activeThesis.minMonthlyRev.toLocaleString()}/mo).`
        );
      } else {
        if (values.reportedMrr === 0) {
          score -= 25;
          redFlags.push(
            `Pre-revenue disqualifier: Zero reported monthly revenue violates minimum ${activeThesis.firmName} threshold ($${activeThesis.minMonthlyRev.toLocaleString()}/mo).`
          );
        } else {
          score -= 14;
          cons.push(
            `Revenue deficit: $${values.reportedMrr.toLocaleString()}/mo MRR is currently beneath the $${activeThesis.minMonthlyRev.toLocaleString()}/mo gate.`
          );
        }
      }

      // Valuation Cap Check
      if (values.valuation <= activeThesis.maxValuation) {
        score += 8;
        pros.push(
          `Disciplined capital structure: Valuation cap ($${(values.valuation / 1e6).toFixed(1)}M) falls safely inside $${(activeThesis.maxValuation / 1e6).toFixed(1)}M limit.`
        );
      } else {
        score -= 24;
        redFlags.push(
          `Valuation breach: $${(values.valuation / 1e6).toFixed(1)}M valuation exceeds firm mandate ceiling of $${(activeThesis.maxValuation / 1e6).toFixed(1)}M.`
        );
      }

      // Multiple check
      const arr = values.reportedMrr * 12;
      if (arr > 0) {
        const multiple = values.valuation / arr;
        if (multiple <= 25) {
          score += 6;
          pros.push(`Attractive valuation multiple: Priced at ~${multiple.toFixed(1)}x annualized revenue.`);
        } else if (multiple > 55) {
          score -= 10;
          cons.push(`High growth expectations: Entry multiple (~${multiple.toFixed(1)}x ARR) demands top-decile retention.`);
        }
      }

      // Stage check
      const preferred = Array.isArray(activeThesis.preferredStage)
        ? activeThesis.preferredStage.join(' ')
        : String(activeThesis.preferredStage || '');
      if (preferred.toLowerCase().includes(values.stage.toLowerCase())) {
        score += 5;
        pros.push(`Target stage match: Raising at preferred ${values.stage} inflection point.`);
      }

      // Clamp score
      const finalScore = Math.min(98, Math.max(20, Math.round(score)));

      // Determine status
      let status: Pitch['status'] = 'REVIEW';
      if (finalScore >= 85 && redFlags.length === 0) {
        status = 'TOP_1_PERCENT';
      } else if (finalScore < 60 || redFlags.length >= 2) {
        status = 'REJECTED';
      }

      // Executive Summary
      const summary = `${values.startupName} is an emerging ${values.stage} startup in ${values.sector} (${values.tagline}), led by ${values.founderNames}. Autonomous Gatekeeper evaluated target ask of $${(values.askAmount / 1e6).toFixed(1)}M against ${activeThesis.firmName} criteria, awarding an alignment rating of ${finalScore}/100.`;

      const newPitch: Pitch = {
        id: `pitch-${Date.now()}`,
        startupName: values.startupName,
        tagline: values.tagline,
        founderNames: values.founderNames,
        founderEmail: values.founderEmail,
        sector: values.sector,
        stage: values.stage,
        askAmount: values.askAmount,
        reportedMrr: values.reportedMrr,
        valuation: values.valuation,
        matchScore: finalScore,
        status,
        summary,
        pros,
        cons,
        redFlags,
        submittedAt: new Date().toISOString(),
        websiteUrl: `https://${values.startupName.toLowerCase().replace(/[^a-z0-9]/g, '')}.io`,
      };

      // 3. Persist to mock store
      return await createMockPitch(newPitch);
    },
    onSuccess: (newPitch) => {
      // Prepend to query cache
      queryClient.setQueryData<Pitch[]>(dealQueryKeys.pitches, (old) => [
        newPitch,
        ...(old || []),
      ]);
      queryClient.invalidateQueries({ queryKey: dealQueryKeys.pitches });
    },
  });
}
