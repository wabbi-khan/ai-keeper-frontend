'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { thesisFormSchema, ThesisFormValues } from '@/lib/validations/deal';
import { mockThesis } from '@/lib/mock-data';
import { useThesisQuery, useUpdateThesisMutation } from '@/hooks/use-deals';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Target,
  DollarSign,
  Building2,
  Plus,
  X,
  RotateCcw,
  Shield,
  Scale,
  BrainCircuit,
  Save,
  Globe,
} from 'lucide-react';

export default function ThesisConfigurationPage() {
  const { slug: userSlug, firmName: userFirmName } = useCurrentUser();
  const { data: thesis = mockThesis } = useThesisQuery(userSlug || undefined);
  const updateThesisMutation = useUpdateThesisMutation();

  const [sectorInput, setSectorInput] = useState('');

  // Suggested quick-add sectors
  const suggestedSectors = [
    'AI Infrastructure',
    'B2B SaaS',
    'FinTech',
    'Longevity',
    'Cybersecurity',
    'Defense Tech',
    'Developer Tools',
    'HealthTech',
  ];

  // Initialize react-hook-form with Zod validation
  const form = useForm<ThesisFormValues>({
    resolver: zodResolver(thesisFormSchema) as any,
    defaultValues: {
      firmName: thesis.firmName,
      slug: thesis.slug,
      targetSectors: thesis.targetSectors,
      minMonthlyRev: thesis.minMonthlyRev,
      maxValuation: thesis.maxValuation,
      preferredStage: 'Seed',
      customCriteria: thesis.customCriteria,
    },
  });

  // Keep form in sync when thesis loads
  useEffect(() => {
    if (thesis) {
      form.reset({
        firmName: thesis.firmName || userFirmName,
        slug: thesis.slug || userSlug,
        targetSectors: thesis.targetSectors,
        minMonthlyRev: thesis.minMonthlyRev,
        maxValuation: thesis.maxValuation,
        preferredStage: (thesis.preferredStage?.includes('Pre-Seed')
          ? 'Pre-Seed'
          : thesis.preferredStage?.includes('Series A')
          ? 'Series A'
          : 'Seed') as 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B+',
        customCriteria: thesis.customCriteria,
      });
    }
  }, [thesis, form, userFirmName, userSlug]);

  // Watch form values for live preview calculation
  const watchedValues = form.watch();

  // Sector Badge Handlers
  const currentSectors = watchedValues.targetSectors || [];

  const handleAddSector = (sector: string) => {
    const trimmed = sector.trim();
    if (!trimmed) return;
    if (!currentSectors.includes(trimmed)) {
      form.setValue('targetSectors', [...currentSectors, trimmed], {
        shouldValidate: true,
      });
    }
    setSectorInput('');
  };

  const handleRemoveSector = (sectorToRemove: string) => {
    form.setValue(
      'targetSectors',
      currentSectors.filter((s) => s !== sectorToRemove),
      { shouldValidate: true }
    );
  };

  // Preset deal-breakers
  const appendDealBreaker = (snippet: string) => {
    const current = form.getValues('customCriteria') || '';
    if (!current.includes(snippet)) {
      const updated = current ? `${current}\n\n• ${snippet}` : `• ${snippet}`;
      form.setValue('customCriteria', updated, { shouldValidate: true });
      toast.info('Rule clause added to gatekeeper instructions');
    }
  };

  // Submit Handler
  const onSubmit = (values: ThesisFormValues) => {
    updateThesisMutation.mutate({
      ...thesis,
      firmName: values.firmName,
      slug: values.slug,
      targetSectors: values.targetSectors,
      minMonthlyRev: values.minMonthlyRev,
      maxValuation: values.maxValuation,
      preferredStage: values.preferredStage,
      customCriteria: values.customCriteria,
    });
  };

  const handleReset = () => {
    form.reset({
      firmName: mockThesis.firmName,
      slug: mockThesis.slug,
      targetSectors: mockThesis.targetSectors,
      minMonthlyRev: mockThesis.minMonthlyRev,
      maxValuation: mockThesis.maxValuation,
      preferredStage: 'Seed',
      customCriteria: mockThesis.customCriteria,
    });
    toast.info('Thesis parameters reset to institutional defaults');
  };

  return (
    <div className="space-y-7">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E2DC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-2xl md:text-3xl font-bold tracking-tight text-[#161514]">
              Investment Thesis Mandate
            </h1>
            <Badge
              variant="outline"
              className="bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0] text-xs px-2.5 py-0.5 font-financial rounded-md"
            >
              Gatekeeper v2.4
            </Badge>
          </div>
          <p className="text-xs text-[#73706A] mt-1 font-sans">
            Configure the strict financial guardrails and natural language deal-breakers enforced by your automated desk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-[#E5E2DC] bg-white text-[#73706A] hover:text-[#161514] hover:bg-[#F3F1EC] text-xs gap-1.5 rounded-md shadow-none cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column: Core Investment Parameters */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Card 1: Identity & Target Sectors */}
            <Card className="bg-white border border-[#E5E2DC] p-5 md:p-6 space-y-5 rounded-md shadow-none">
              <div className="border-b border-[#E5E2DC] pb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#F3F1EC] flex items-center justify-center border border-[#E5E2DC] text-[#163728]">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#161514]">
                      Firm Profile & Sectors
                    </h2>
                    <p className="text-[11px] text-[#73706A]">
                      Mandate identity and in-scope target domains
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Firm Name Input */}
                <FormField
                  control={form.control}
                  name="firmName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-sans font-medium text-[#161514]">
                        Firm / Family Office Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Apex Family Office"
                          className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slug Input */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-sans font-medium text-[#161514]">
                        Portal URL Slug *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. your-firm-slug"
                          className="bg-white border-[#E5E2DC] text-xs font-financial text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px] text-[#73706A]">
                        dealflow.ai/submit/{field.value || 'slug'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Target Sectors Selector */}
              <FormField
                control={form.control}
                name="targetSectors"
                render={() => (
                  <FormItem className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-sans font-medium text-[#161514]">
                        Active Target Sectors ({currentSectors.length}) *
                      </FormLabel>
                      <span className="text-[11px] text-[#73706A] font-financial">
                        Deals outside incur scoring deduction
                      </span>
                    </div>

                    {/* Active Badges List */}
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] min-h-[48px]">
                      {currentSectors.length === 0 ? (
                        <span className="text-xs text-[#73706A] italic py-1">
                          No sectors selected. Add sectors below.
                        </span>
                      ) : (
                        currentSectors.map((sector) => (
                          <Badge
                            key={sector}
                            className="bg-white hover:bg-[#F3F1EC] text-[#161514] border-[#E5E2DC] text-xs px-2.5 py-0.5 gap-1.5 rounded-md font-medium group transition-all shadow-none"
                          >
                            <span>{sector}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSector(sector)}
                              className="text-[#A5A29C] hover:text-[#862820] p-0.5 rounded transition-colors cursor-pointer"
                              aria-label={`Remove ${sector}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>

                    {/* Add Custom Sector Input */}
                    <div className="flex gap-2">
                      <Input
                        value={sectorInput}
                        onChange={(e) => setSectorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSector(sectorInput);
                          }
                        }}
                        placeholder="Type a custom sector (e.g. AI Infrastructure)..."
                        className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-8 rounded-md shadow-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSector(sectorInput)}
                        className="border-[#E5E2DC] bg-[#F3F1EC] text-[#161514] hover:bg-[#EAE8E2] text-xs px-3 h-8 gap-1 rounded-md shadow-none cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>

                    {/* Suggested Sector Pills */}
                    <div className="pt-1">
                      <span className="text-[11px] text-[#73706A] block mb-1.5">
                        Suggested Sectors (click to toggle):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedSectors.map((sector) => {
                          const isSelected = currentSectors.includes(sector);
                          return (
                            <button
                              key={sector}
                              type="button"
                              onClick={() =>
                                isSelected
                                  ? handleRemoveSector(sector)
                                  : handleAddSector(sector)
                              }
                              className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0]'
                                  : 'bg-white text-[#73706A] border-[#E5E2DC] hover:border-[#163728] hover:text-[#161514]'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {sector}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Card 2: Financial Guardrails */}
            <Card className="bg-white border border-[#E5E2DC] p-5 md:p-6 space-y-5 rounded-md shadow-none">
              <div className="border-b border-[#E5E2DC] pb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#F3F1EC] flex items-center justify-center border border-[#E5E2DC] text-[#163728]">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#161514]">
                      Financial Guardrails
                    </h2>
                    <p className="text-[11px] text-[#73706A]">
                      Hard numerical bounds for automated deal gating
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Minimum Monthly Revenue */}
                <FormField
                  control={form.control}
                  name="minMonthlyRev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-sans font-medium text-[#161514]">
                        Min MRR (USD) *
                      </FormLabel>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-[#73706A] text-xs font-financial">$</span>
                        <FormControl>
                          <Input
                            type="number"
                            className="pl-6 bg-white border-[#E5E2DC] text-xs font-financial text-[#161514] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormDescription className="text-[11px] text-[#73706A] font-financial">
                        ~${((Number(field.value || 0) * 12) / 1000).toFixed(0)}k ARR floor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Maximum Valuation Cap */}
                <FormField
                  control={form.control}
                  name="maxValuation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-sans font-medium text-[#161514]">
                        Max Valuation Cap (USD) *
                      </FormLabel>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-[#73706A] text-xs font-financial">$</span>
                        <FormControl>
                          <Input
                            type="number"
                            className="pl-6 bg-white border-[#E5E2DC] text-xs font-financial text-[#161514] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormDescription className="text-[11px] text-[#73706A] font-financial">
                        ${(Number(field.value || 0) / 1_000_000).toFixed(1)}M upper limit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferred Stage */}
                <FormField
                  control={form.control}
                  name="preferredStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-sans font-medium text-[#161514]">
                        Preferred Stage *
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-white border-[#E5E2DC] text-xs text-[#161514] focus-visible:border-[#163728] h-9 rounded-md shadow-none">
                            <SelectValue placeholder="Select Stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-[#E5E2DC] text-[#161514] shadow-none">
                          <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                          <SelectItem value="Seed">Seed</SelectItem>
                          <SelectItem value="Series A">Series A</SelectItem>
                          <SelectItem value="Series B+">Series B+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[11px] text-[#73706A] font-sans">
                        Target investment round
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Card 3: Custom AI Gatekeeper Prompt & Deal-Breakers */}
            <Card className="bg-white border border-[#E5E2DC] p-5 md:p-6 space-y-5 rounded-md shadow-none">
              <div className="border-b border-[#E5E2DC] pb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#F3F1EC] flex items-center justify-center border border-[#E5E2DC] text-[#163728]">
                    <BrainCircuit className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#161514]">
                      Custom AI Gatekeeper Hard Rules
                    </h2>
                    <p className="text-[11px] text-[#73706A]">
                      Natural language prompt instructions and fatal disqualification rules
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-[#FAECEB] text-[#862820] border-[#F1C9C5] text-[10px] font-financial px-2 py-0.5 rounded-md"
                >
                  Zero-Tolerance
                </Badge>
              </div>

              <FormField
                control={form.control}
                name="customCriteria"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-sans font-medium text-[#161514]">
                      AI Prompt Reasoning Directive *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Immediately reject solo non-technical founders, pre-revenue consumer apps, or startups with burn rate exceeding 2x MRR..."
                        className="bg-[#F9F8F5] border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] font-financial leading-relaxed p-3 rounded-md shadow-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px] text-[#73706A]">
                      The AI analyst evaluates deck text and financials against this exact directive to generate Match Scores and Red Flags.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick Deal-Breaker Snippet Buttons */}
              <div className="pt-1 border-t border-[#E5E2DC]">
                <span className="text-[11px] text-[#73706A] block mb-2 font-sans">
                  Click to append standard deal-breaker clauses:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Immediately reject solo non-technical founders without full-time CTO',
                    'Auto-disqualify pure consumer hardware with negative gross margins',
                    'Require verifiable Net Revenue Retention (NRR) > 115%',
                    'Reject token-gated Web3 consumer apps with unregistered tokens',
                    'Auto-reject any deck with burn rate exceeding 2x reported monthly revenue',
                  ].map((clause, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => appendDealBreaker(clause)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-[#F3F1EC] border border-[#E5E2DC] hover:border-[#163728] text-[#161514] transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#163728] shrink-0" />
                      <span>{clause}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Live AI Scoring Weight Preview (Sticky) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-16 space-y-5">
            <Card className="bg-white border border-[#E5E2DC] rounded-md shadow-none overflow-hidden">
              <CardHeader className="border-b border-[#E5E2DC] p-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#163728]" />
                    <CardTitle className="text-sm font-bold text-[#161514] font-sans">
                      Live AI Scoring Weights
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0] text-[10px] font-financial px-1.5 py-0 rounded"
                  >
                    Active Engine
                  </Badge>
                </div>
                <CardDescription className="text-xs text-[#73706A] mt-0.5 font-sans">
                  Algorithmic weight distribution across incoming pitch decks
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Scoring Weights Breakdown */}
                <div className="space-y-3.5">
                  {/* Weight 1: Thesis Alignment (40%) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[#161514] flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#163728]" />
                        Thesis Alignment
                      </span>
                      <span className="font-financial font-bold text-[#163728]">40%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E5E2DC] overflow-hidden">
                      <div className="h-full bg-[#163728] rounded-full w-[40%]" />
                    </div>
                    <span className="text-[10px] text-[#73706A] block">
                      Sector relevance, stage match & mandate scope
                    </span>
                  </div>

                  {/* Weight 2: Financial Health (30%) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[#161514] flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#7E4812]" />
                        Financial Health
                      </span>
                      <span className="font-financial font-bold text-[#7E4812]">30%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E5E2DC] overflow-hidden">
                      <div className="h-full bg-[#965A18] rounded-full w-[30%]" />
                    </div>
                    <span className="text-[10px] text-[#73706A] block">
                      MRR floor (${Number(watchedValues.minMonthlyRev || 0).toLocaleString()}), valuation discipline, ARR multiple
                    </span>
                  </div>

                  {/* Weight 3: Founder & Market Fit (30%) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[#161514] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#33302A]" />
                        Founder & Market Fit
                      </span>
                      <span className="font-financial font-bold text-[#33302A]">30%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E5E2DC] overflow-hidden">
                      <div className="h-full bg-[#524E46] rounded-full w-[30%]" />
                    </div>
                    <span className="text-[10px] text-[#73706A] block">
                      Technical pedigree, IP moat, customer retention & CAC payback
                    </span>
                  </div>
                </div>

                {/* Active Summary Snapshot */}
                <div className="p-3.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] text-xs space-y-2">
                  <div className="text-[10px] font-financial uppercase tracking-wider text-[#73706A]">
                    Active Guardrail Summary
                  </div>
                  <div className="flex justify-between items-center text-[#73706A]">
                    <span>Firm Mandate:</span>
                    <span className="font-semibold text-[#161514] truncate max-w-[160px]">{watchedValues.firmName}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#73706A]">
                    <span>Public Slug:</span>
                    <span className="font-financial text-[#163728] font-medium">{watchedValues.slug}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#73706A]">
                    <span>Sectors Covered:</span>
                    <span className="font-financial text-[#161514]">{currentSectors.length} active</span>
                  </div>
                  <div className="flex justify-between items-center text-[#73706A]">
                    <span>Min MRR Required:</span>
                    <span className="font-financial text-[#163728] font-semibold">
                      ${Number(watchedValues.minMonthlyRev || 0).toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#73706A]">
                    <span>Max Valuation Cap:</span>
                    <span className="font-financial text-[#161514]">
                      ${(Number(watchedValues.maxValuation || 0) / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#73706A]">
                    <span>Preferred Stage:</span>
                    <span className="font-financial text-[#161514]">{watchedValues.preferredStage}</span>
                  </div>
                </div>

                {/* Gatekeeper Engine Status */}
                <div className="p-2.5 rounded-md bg-[#E6EFEA] border border-[#C3DCD0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#163728]" />
                    <span className="text-[#1A422F] font-medium">Gatekeeper Armed</span>
                  </div>
                  <span className="text-[10px] text-[#1A422F] font-financial">
                    ~4.2% Pass Rate
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  type="submit"
                  disabled={updateThesisMutation.isPending}
                  className="w-full bg-[#163728] hover:bg-[#10291e] text-[#F9F8F5] font-medium py-2.5 rounded-md flex items-center justify-center gap-2 shadow-none transition-all cursor-pointer text-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    {updateThesisMutation.isPending
                      ? 'Recalibrating Models...'
                      : 'Save & Recalibrate AI Gatekeeper'}
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
