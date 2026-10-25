import { api } from '@/lib/api';
import { Pitch } from '@/types/deal';
import { PitchSubmissionValues } from '@/lib/validations/deal';

export const pitchService = {
  /**
   * Submit pitch deck with PDF and form data to backend AI gatekeeper
   */
  submitPitch: async (
    slug: string,
    payload: PitchSubmissionValues | FormData
  ): Promise<Pitch> => {
    let formData: FormData;

    if (payload instanceof FormData) {
      formData = payload;
    } else {
      formData = new FormData();
      formData.append('startupName', payload.startupName);
      if (payload.tagline) {
        formData.append('tagline', payload.tagline);
      }
      formData.append('founderNames', payload.founderNames);
      formData.append('founderEmail', payload.founderEmail);
      formData.append('sector', payload.sector);
      formData.append('stage', payload.stage);
      formData.append('reportedMrr', String(payload.reportedMrr));
      formData.append('askAmount', String(payload.askAmount));
      formData.append('valuation', String(payload.valuation));

      if (payload.pitchDeck instanceof File) {
        formData.append('pitchDeck', payload.pitchDeck);
        formData.append('file', payload.pitchDeck);
      }
    }

    const res = await api.post<{
      success: boolean;
      message: string;
      data: Pitch;
    }>(`/pitches/submit/${slug}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data.data;
  },

  /**
   * Fetch all inbound pitches filtered by thesis slug, status, search, and page
   */
  getPitches: async (
    slugOrParams?:
      | string
      | { slug?: string; status?: string; search?: string; page?: number; sector?: string },
    maybeFilters?: { status?: string; sector?: string; search?: string; page?: number }
  ): Promise<Pitch[]> => {
    let slug = 'apex-family-office';
    let filters: { status?: string; sector?: string; search?: string; page?: number } | undefined;

    if (typeof slugOrParams === 'string') {
      slug = slugOrParams;
      filters = maybeFilters;
    } else if (slugOrParams && typeof slugOrParams === 'object') {
      if (slugOrParams.slug) slug = slugOrParams.slug;
      filters = slugOrParams;
    }

    const params = new URLSearchParams();
    if (slug) params.append('slug', slug);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.sector && filters.sector !== 'ALL') params.append('sector', filters.sector);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));

    const res = await api.get<{ success: boolean; data: Pitch[] }>(
      `/pitches?${params.toString()}`
    );
    return res.data.data;
  },

  /**
   * Fetch a single pitch by ID
   */
  getPitchById: async (pitchId: string, slug?: string): Promise<Pitch | null> => {
    const list = await pitchService.getPitches(slug || 'apex-family-office');
    return list.find((p) => p.id === pitchId) || null;
  },

  /**
   * Update triage status of a pitch (TOP_1_PERCENT, REVIEW, REJECTED)
   */
  updatePitchStatus: async (pitchId: string, status: string): Promise<Pitch> => {
    const res = await api.patch<{ success: boolean; data: Pitch }>(
      `/pitches/${pitchId}/status`,
      { status }
    );
    return res.data.data;
  },
};

export default pitchService;
