import { z } from 'zod';

/**
 * Zod validation schema for the Family Office investment thesis mandate
 */
export const thesisFormSchema = z.object({
  firmName: z
    .string()
    .min(2, 'Firm name is required and must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase letters, numbers, and hyphens only'
    ),
  targetSectors: z
    .array(z.string())
    .min(1, 'Select at least one target sector'),
  minMonthlyRev: z.coerce
    .number()
    .min(0, 'MRR cannot be negative'),
  maxValuation: z.coerce
    .number()
    .min(100000, 'Max valuation must be at least $100,000'),
  preferredStage: z.enum(['Pre-Seed', 'Seed', 'Series A', 'Series B+']),
  customCriteria: z
    .string()
    .min(20, 'Provide at least 20 characters of specific AI gatekeeper rules'),
});

export type ThesisFormValues = z.infer<typeof thesisFormSchema>;

/**
 * Zod validation schema for the public founder pitch deck submission portal
 */
export const pitchSubmissionSchema = z
  .object({
    startupName: z
      .string()
      .min(2, 'Startup name must be at least 2 characters'),
    tagline: z
      .string()
      .min(10, 'Tagline must be at least 10 characters')
      .max(120, 'Tagline cannot exceed 120 characters'),
    founderNames: z
      .string()
      .min(2, 'Founder name(s) must be at least 2 characters'),
    founderEmail: z
      .string()
      .email('Enter a valid corporate email address'),
    sector: z
      .string()
      .min(2, 'Please select or enter an industry sector'),
    stage: z.enum(['Pre-Seed', 'Seed', 'Series A', 'Series B+']),
    reportedMrr: z.coerce
      .number()
      .min(0, 'MRR must be 0 or greater'),
    askAmount: z.coerce
      .number()
      .min(10000, 'Minimum raise ask is $10,000'),
    valuation: z.coerce
      .number()
      .min(100000, 'Valuation must be at least $100,000'),
    pitchDeck: z
      .custom<File>(
        (val) => typeof window === 'undefined' || val instanceof File,
        'A PDF pitch deck is required'
      )
      .refine(
        (file) =>
          typeof window === 'undefined' ||
          (file instanceof File &&
            (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))),
        'Must be a valid PDF file (.pdf)'
      )
      .refine(
        (file) =>
          typeof window === 'undefined' ||
          (file instanceof File && file.size <= 15 * 1024 * 1024),
        'Pitch deck must be under 15MB'
      ),
  })
  .refine((data) => data.valuation > data.askAmount, {
    message: 'Post-money valuation must be greater than the ask amount',
    path: ['valuation'],
  });

export type PitchSubmissionValues = z.infer<typeof pitchSubmissionSchema>;
