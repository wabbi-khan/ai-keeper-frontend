export type PitchStatus = 'TOP_1_PERCENT' | 'REVIEW' | 'REJECTED';

export type PitchStage = 
  | 'Pre-Seed' 
  | 'Seed' 
  | 'Series A' 
  | 'Series B' 
  | 'Growth' 
  | string;

export interface InvestorUser {
  id: string;
  name: string;
  email: string;
  firmName: string;
  slug: string;
  role: string;
  avatarUrl?: string;
}

export interface Pitch {
  id: string;
  startupName: string;
  tagline: string;
  founderNames: string;
  founderEmail: string;
  sector: string;
  stage: PitchStage;
  askAmount: number;
  reportedMrr: number;
  valuation: number;
  matchScore: number; // 0-100
  status: PitchStatus;
  summary: string;
  pros: string[];
  cons: string[];
  redFlags: string[];
  referenceId?: string;
  deckFileName?: string;
  deckMimeType?: string;
  deckPdfPath?: string;
  deckUrl?: string;
  pitchDeckUrl?: string;
  websiteUrl?: string;
  submittedAt: string;
  teamSize?: number;
  location?: string;
}

export interface InvestorThesis {
  firmName: string;
  slug: string;
  targetSectors: string[];
  minMonthlyRev: number;
  maxValuation: number;
  preferredStage: string | string[];
  customCriteria: string;
  minMatchScore?: number;
  targetCheckSize?: {
    min: number;
    max: number;
  };
  keyExclusions?: string[];
}
