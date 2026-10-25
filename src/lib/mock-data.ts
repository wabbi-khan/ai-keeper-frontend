import { Pitch, InvestorThesis, InvestorUser } from '@/types/deal';

export const mockInvestorUsers: InvestorUser[] = [
  {
    id: 'user-apex-01',
    name: 'Victoria Sterling',
    email: 'victoria@apexfamily.office',
    firmName: 'Apex Family Office',
    slug: 'apex-family-office',
    role: 'Managing Partner',
  },
  {
    id: 'user-horizon-02',
    name: 'Marcus Vance',
    email: 'marcus@horizonvc.com',
    firmName: 'Horizon Ventures',
    slug: 'horizon-ventures',
    role: 'General Partner',
  },
];

export const mockThesis: InvestorThesis = {
  firmName: 'Apex Family Office',
  slug: 'apex-family-office',
  targetSectors: [
    'B2B SaaS',
    'Enterprise AI',
    'Cybersecurity',
    'Fintech Infrastructure',
  ],
  minMonthlyRev: 35000, // $35k/mo MRR minimum (~$420k ARR)
  maxValuation: 25000000, // $25M valuation cap
  preferredStage: 'Seed / Series A',
  customCriteria:
    'Prioritize enterprise workflows with proprietary data flywheels, verifiable customer retention (NRR > 115%), and >75% software gross margins. Founders must demonstrate technical pedigree and capital efficiency. Immediate auto-rejection for token-gated consumer apps, negative unit-economics hardware, or hype-driven LLM wrapper layers with no moat.',
  minMatchScore: 85,
  targetCheckSize: {
    min: 1000000,
    max: 3000000,
  },
  keyExclusions: [
    'B2C D2C e-commerce',
    'Crypto / Web3 meme tokens',
    'Capital-intensive robotics without contracts',
  ],
};

export const mockThesisHorizon: InvestorThesis = {
  firmName: 'Horizon Ventures',
  slug: 'horizon-ventures',
  targetSectors: [
    'AI Infrastructure',
    'Developer Tools',
    'Cybersecurity',
    'Open Source Systems',
  ],
  minMonthlyRev: 20000, // $20k/mo MRR (~$240k ARR)
  maxValuation: 20000000, // $20M valuation cap
  preferredStage: 'Pre-Seed / Seed',
  customCriteria:
    'Deep technical infrastructure, developer tooling with organic developer adoption (>3k GitHub stars), high commit velocity, and clear enterprise support or hosted monetization path. Founders must have senior engineering background at hyperscalers or tier-1 research labs.',
  minMatchScore: 80,
  targetCheckSize: {
    min: 750000,
    max: 2000000,
  },
  keyExclusions: [
    'Consumer marketplace',
    'AdTech platforms',
    'Low-code agency tools without IP',
  ],
};

export const mockTheses: Record<string, InvestorThesis> = {
  'apex-family-office': mockThesis,
  'horizon-ventures': mockThesisHorizon,
};

export function getThesisBySlug(slug: string): InvestorThesis {
  return mockTheses[slug] || {
    ...mockThesis,
    slug: slug || 'apex-family-office',
    firmName: slug
      ? slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Apex Family Office',
  };
}

export const mockPitches: Pitch[] = [
  {
    id: 'pitch-001',
    startupName: 'NeuralShield AI',
    tagline: 'Autonomous runtime defense against LLM prompt injection and API data exfiltration',
    founderNames: 'Dr. Elena Rostova & Marcus Vance',
    founderEmail: 'elena@neuralshield.ai',
    sector: 'Cybersecurity',
    stage: 'Series A',
    askAmount: 3500000,
    reportedMrr: 168000,
    valuation: 22000000,
    matchScore: 96,
    status: 'TOP_1_PERCENT',
    summary:
      'Zero-latency inline proxy that inspects high-throughput LLM enterprise pipelines, thwarting indirect prompt injections, jailbreaks, and sensitive data leakage. Serving 18 Fortune 500 customers with zero churn in the last 12 months.',
    pros: [
      'Exceptional ARR growth: $2.01M run rate, up 240% YoY with 132% Net Revenue Retention',
      'Dual proprietary patents granted on semantic latent-space token inspection',
      'Founders are ex-CrowdStrike Head of Threat Intelligence and MIT NLP PhD',
      'SOC2 Type II and ISO 27001 certified with existing AWS Marketplace partnership',
    ],
    cons: [
      'Enterprise sales cycle averages 75-90 days due to SecOps procurement gatekeeping',
      'High compute cost for specialized real-time inference clusters (gross margins currently 77%)',
    ],
    redFlags: [],
    submittedAt: '2026-10-24T18:22:10Z',
    websiteUrl: 'https://neuralshield.ai',
    teamSize: 22,
    location: 'San Francisco, CA',
  },
  {
    id: 'pitch-002',
    startupName: 'AgenticLedger',
    tagline: 'Autonomous AI transfer pricing & multi-jurisdiction tax reconciliation for multinationals',
    founderNames: 'Julian Sterling & Priya Nair',
    founderEmail: 'julian@agenticledger.io',
    sector: 'Fintech Infrastructure',
    stage: 'Seed',
    askAmount: 2200000,
    reportedMrr: 94000,
    valuation: 16000000,
    matchScore: 93,
    status: 'TOP_1_PERCENT',
    summary:
      'Replaces $300k/year Big Four audit retainers with real-time continuous transfer pricing calculation and automated OECD Pillar Two compliance reports for global multi-subsidiary corporations.',
    pros: [
      'Rapid ramp to $1.1M ARR within 14 months of launching private beta',
      'Average contract size (ACV) of $85,000 with 100% upfront annual prepayments',
      'Direct ERP integrations with SAP S/4HANA, NetSuite, and Workday Financials',
      'Founder previously led International Tax Systems at Stripe',
    ],
    cons: [
      'Regulatory compliance shifts require continuous legal and rule-engine validation',
      'Requires domain-specialist account executives to close mid-market CFOs',
    ],
    redFlags: [],
    submittedAt: '2026-10-23T14:15:30Z',
    websiteUrl: 'https://agenticledger.io',
    teamSize: 14,
    location: 'New York, NY',
  },
  {
    id: 'pitch-003',
    startupName: 'OmniFlow Logistics',
    tagline: 'Autonomous customs clearance and dynamic drayage routing for intermodal freight',
    founderNames: 'Tarek Mansour & Chen Wei',
    founderEmail: 'tarek@omniflow.supply',
    sector: 'B2B SaaS',
    stage: 'Seed',
    askAmount: 2000000,
    reportedMrr: 72000,
    valuation: 14000000,
    matchScore: 88,
    status: 'TOP_1_PERCENT',
    summary:
      'Connects maritime port terminal feeds with automated customs entry declarations and inland truck dispatch, cutting container dwell time from 4.8 days to under 18 hours across 6 major US ports.',
    pros: [
      '$864k ARR with signed letters of intent for an additional $1.4M pipeline',
      'Deep technical integrations with US Customs ACE system and maritime carriers',
      'Negative net churn (-18%) as shipping volume scales organically on platform',
    ],
    cons: [
      'Freight cycle volatility can impact spot volume during trade contraction quarters',
      'Expansion into European ports requires building out distinct Union Customs Code (UCC) adapters',
    ],
    redFlags: [],
    submittedAt: '2026-10-22T09:40:00Z',
    websiteUrl: 'https://omniflow.supply',
    teamSize: 11,
    location: 'Chicago, IL',
  },
  {
    id: 'pitch-004',
    startupName: 'Veritas Health AI',
    tagline: 'Ambient clinical documentation & surgical coding platform for orthopedic networks',
    founderNames: 'Dr. Gregory Houseman & Linda Becker',
    founderEmail: 'linda@veritashealth.med',
    sector: 'Enterprise AI',
    stage: 'Seed',
    askAmount: 1800000,
    reportedMrr: 42000,
    valuation: 13500000,
    matchScore: 78,
    status: 'REVIEW',
    summary:
      'Specialized acoustic models capturing ambient surgical suite discussions to output instant ICD-10 and CPT coding, cutting billing denials by 41% across 9 ambulatory surgical centers.',
    pros: [
      'Strong clinical pull: 9 surgical centers live and reporting 2.1 hours saved per surgeon/day',
      'High switching barrier once embedded into Epic and Cerner EHR workflows',
      'Clear unit economics with 82% software gross margins',
    ],
    cons: [
      'Slower than anticipated sales ramp ($504k ARR currently vs $800k target)',
      'Intense competition from well-funded incumbents (Abridge, Nuance/DAX, Ambience Healthcare)',
      'Sub-specialty expansion requires custom training datasets for each surgical division',
    ],
    redFlags: [],
    submittedAt: '2026-10-21T11:05:42Z',
    websiteUrl: 'https://veritashealth.med',
    teamSize: 9,
    location: 'Boston, MA',
  },
  {
    id: 'pitch-005',
    startupName: 'KuraData Engine',
    tagline: 'High-fidelity synthetic data generation for fintech compliance and model stress-testing',
    founderNames: 'Siddharth Patel & Amy Thorne',
    founderEmail: 'sid@kuradata.com',
    sector: 'B2B SaaS',
    stage: 'Pre-Seed',
    askAmount: 1200000,
    reportedMrr: 29000,
    valuation: 9500000,
    matchScore: 71,
    status: 'REVIEW',
    summary:
      'Generates statistically identical, mathematically non-invertible synthetic financial transaction records so tier-1 banks can stress-test AML and fraud models without leaking real PII.',
    pros: [
      'Strong mathematical rigor: differential privacy guarantees with epsilon < 0.5',
      'Signed 3 pilot proof-of-concepts with regional banks at $50k each',
      'Low infrastructure overhead with Docker-based on-prem deployment options',
    ],
    cons: [
      'Current MRR ($29,000) falls slightly below Apex thesis threshold of $35,000/mo',
      'Sales cycle heavily gated by banking internal risk management committees',
      'Small engineering team (4 members) with high single-point dependency on founder mathematician',
    ],
    redFlags: [],
    submittedAt: '2026-10-20T16:30:15Z',
    websiteUrl: 'https://kuradata.com',
    teamSize: 5,
    location: 'Austin, TX',
  },
  {
    id: 'pitch-006',
    startupName: 'BlockZen Estates',
    tagline: 'Fractional luxury villa tokenization with algorithmic rental yield staking',
    founderNames: 'Brett "CryptoChad" Harrison & Cody Sterling',
    founderEmail: 'brett@blockzenestates.xyz',
    sector: 'Fintech Infrastructure',
    stage: 'Seed',
    askAmount: 4500000,
    reportedMrr: 4800,
    valuation: 42000000,
    matchScore: 28,
    status: 'REJECTED',
    summary:
      'Allows retail crypto investors to purchase micro-shares of Bali and Tulum luxury villas via ERC-3643 tokens, promising 18% APY staking rewards funded by short-term vacation rentals.',
    pros: [
      'Active social media presence (45,000 Twitter/X followers)',
      'Slick mobile application with crypto wallet onboarding',
    ],
    cons: [
      'Extremely high valuation ask ($42M) with almost negligible recurring software revenue ($4.8k MRR)',
      'Dependent entirely on speculative crypto bull cycles and vacation rental occupancy',
    ],
    redFlags: [
      'Financial Disconnect: Asking $42M valuation on under $60k annualized revenue (700x ARR multiple)',
      'Regulatory Hazard: Structure strongly resembles unregistered securities offering under SEC Howey test',
      'Excessive Founder Overhead: Team drawing $35,000/month in advisory and promotion fees while burning cash',
      'Capital Allocation: Only 1 villa currently deeded, remaining assets are non-binding options',
    ],
    submittedAt: '2026-10-19T20:12:00Z',
    websiteUrl: 'https://blockzenestates.xyz',
    teamSize: 6,
    location: 'Miami, FL',
  },
  {
    id: 'pitch-007',
    startupName: 'QuickDrop Bot Fleet',
    tagline: 'Last-mile 15-minute campus snack and beverage delivery via autonomous sidewalk pods',
    founderNames: 'Jaxson Reed & Leo Kim',
    founderEmail: 'jaxson@quickdropbots.io',
    sector: 'B2B SaaS',
    stage: 'Pre-Seed',
    askAmount: 3000000,
    reportedMrr: 6200,
    valuation: 28000000,
    matchScore: 35,
    status: 'REJECTED',
    summary:
      'Deploying custom-built 4-wheel sidewalk rovers to deliver snacks, boba, and energy drinks to university dorm rooms in under 15 minutes for a flat $1.99 delivery fee.',
    pros: [
      'High student engagement across two test university campuses',
      'Hardware prototypes built and operational',
    ],
    cons: [
      'Severe hardware capital expenditure with high maintenance costs',
      'No proprietary software moat or defensible IP',
    ],
    redFlags: [
      'Negative Unit Economics: Company loses $14.20 on every fulfilled order after teleoperation and battery depreciation',
      'Severe Burn Rate: Monthly net burn of $145,000 against $6,200 monthly revenue (< 3 months runway remaining)',
      'Severe Municipal & Regulatory Blockers: City councils already issuing sidewalk obstruction citations and impound warnings',
      'Sector Mismatch: Capital-heavy hardware logistics with consumer delivery risk, in violation of Apex B2B mandate',
    ],
    submittedAt: '2026-10-18T13:45:22Z',
    websiteUrl: 'https://quickdropbots.io',
    teamSize: 8,
    location: 'Tempe, AZ',
  },
];

// In-memory mutable cache to simulate backend DB updates across sessions
let inMemoryPitches: Pitch[] = [...mockPitches];

export async function fetchMockPitches(): Promise<Pitch[]> {
  // Simulate 120ms network latency
  await new Promise((resolve) => setTimeout(resolve, 120));
  return [...inMemoryPitches];
}

export async function updateMockPitchStatus(
  id: string,
  status: Pitch['status']
): Promise<Pitch> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const index = inMemoryPitches.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Pitch with id "${id}" not found.`);
  }
  const updated = { ...inMemoryPitches[index], status };
  inMemoryPitches[index] = updated;
  return updated;
}

export async function bulkUpdateMockPitchStatus(
  ids: string[],
  status: Pitch['status']
): Promise<Pitch[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const idSet = new Set(ids);
  inMemoryPitches = inMemoryPitches.map((p) =>
    idSet.has(p.id) ? { ...p, status } : p
  );
  return inMemoryPitches.filter((p) => idSet.has(p.id));
}

export async function fetchMockThesis(slug: string = 'apex-family-office'): Promise<InvestorThesis> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return getThesisBySlug(slug);
}

export async function updateMockThesis(
  updatedThesis: InvestorThesis
): Promise<InvestorThesis> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  mockTheses[updatedThesis.slug] = { ...updatedThesis };
  if (updatedThesis.slug === 'apex-family-office') {
    Object.assign(mockThesis, updatedThesis);
  }
  return { ...updatedThesis };
}

export async function createMockPitch(pitch: Pitch): Promise<Pitch> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  inMemoryPitches = [pitch, ...inMemoryPitches];
  return pitch;
}


