import { api } from '@/lib/api';
import { InvestorThesis } from '@/types/deal';

export const thesisService = {
  /**
   * Fetch public thesis mandate parameters by unique investor slug
   */
  getPublicThesis: async (slug: string): Promise<InvestorThesis> => {
    const res = await api.get<{ success: boolean; data: InvestorThesis }>(`/thesis/${slug}`);
    return res.data.data;
  },

  /**
   * Update investor thesis mandate parameters (requires JWT auth)
   */
  updateThesis: async (slug: string, data: Partial<InvestorThesis>): Promise<InvestorThesis> => {
    const res = await api.put<{ success: boolean; data: InvestorThesis }>(`/thesis/${slug}`, data);
    return res.data.data;
  },
};

export default thesisService;
