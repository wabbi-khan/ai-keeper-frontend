'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pitchSubmissionSchema, PitchSubmissionValues } from '@/lib/validations/deal';
import { useSubmitPitchMutation } from '@/hooks/use-deals';
import { InvestorThesis, Pitch } from '@/types/deal';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Upload, 
  Send,
  CheckCircle2, 
  Clock, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Lock, 
  ArrowRight, 
  Copy, 
  Check, 
  Shield, 
  FileCheck2, 
  FileUp,
  Target,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

type SubmissionState = 'idle' | 'processing' | 'completed';

interface PortalClientProps {
  slug: string;
  initialThesis: InvestorThesis;
}

export function PitchSubmissionPortal({ slug, initialThesis }: PortalClientProps) {
  const thesis = initialThesis;
  const submitPitchMutation = useSubmitPitchMutation();

  // Drag & drop file ref
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing & completed states
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [currentStep, setCurrentStep] = useState(1);
  const [progressValue, setProgressValue] = useState(0);
  const [generatedPitch, setGeneratedPitch] = useState<Pitch | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  // Initialize react-hook-form
  const form = useForm<PitchSubmissionValues>({
    resolver: zodResolver(pitchSubmissionSchema) as any,
    defaultValues: {
      startupName: '',
      tagline: '',
      founderNames: '',
      founderEmail: '',
      sector: thesis.targetSectors[0] || 'Enterprise AI',
      stage: 'Seed',
      reportedMrr: 35000,
      askAmount: 2000000,
      valuation: 15000000,
      pitchDeck: undefined as any,
    },
  });

  const watchedFile = form.watch('pitchDeck');
  const watchedMrr = form.watch('reportedMrr');
  const watchedAsk = form.watch('askAmount');
  const watchedValuation = form.watch('valuation');

  // File size formatting helper
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleFileSelected = (file: File | null) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      form.setError('pitchDeck', {
        type: 'manual',
        message: 'Only PDF pitch decks are supported (.pdf)',
      });
      toast.error('Only PDF pitch decks are supported (.pdf)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      form.setError('pitchDeck', {
        type: 'manual',
        message: 'Pitch deck file size must not exceed 15MB',
      });
      toast.error('Pitch deck exceeds maximum size limit (15MB)');
      return;
    }

    form.setValue('pitchDeck', file, { shouldValidate: true });
    form.clearErrors('pitchDeck');
    toast.success(`Attached "${file.name}" (${formatFileSize(file.size)})`);
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleDeck = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const sName = form.getValues('startupName');
    const name = sName ? `${sName.replace(/\s+/g, '_')}_Deck.pdf` : 'Aegis_Bio_Series_Seed_Deck.pdf';
    const sample = new File(['%PDF-1.4 Mock pitch deck stream'], name, {
      type: 'application/pdf',
    });
    handleFileSelected(sample);
  };

  // Submit Handler connected to TanStack Query mutation
  const onSubmit = async (values: PitchSubmissionValues) => {
    setSubmissionState('processing');
    setCurrentStep(1);
    setProgressValue(20);

    // Simulated multi-step progress steps
    const timer1 = setTimeout(() => {
      setCurrentStep(2);
      setProgressValue(60);
    }, 900);

    const timer2 = setTimeout(() => {
      setCurrentStep(3);
      setProgressValue(88);
    }, 1800);

    try {
      // Execute the real TanStack mutation
      const result = await submitPitchMutation.mutateAsync({
        values,
        thesisSlug: slug,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      setProgressValue(100);
      const prefix = thesis.firmName.split(' ')[0].toUpperCase().slice(0, 3) || 'APX';
      const refId = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}-AI`;
      setReferenceId(refId);
      setGeneratedPitch(result);
      setSubmissionState('completed');

      toast.success('Pitch Dossier Successfully Processed & Audited!', {
        description: `Alignment score: ${result.matchScore}/100. Logged to ${thesis.firmName} partner desk.`,
        duration: 5000,
      });
    } catch (err) {
      setSubmissionState('idle');
      toast.error('Submission failed', {
        description: err instanceof Error ? err.message : 'Please check your inputs and try again.',
      });
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referenceId);
    setCopiedRef(true);
    toast.info('Reference ID copied to clipboard');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleResetForm = () => {
    form.reset();
    setGeneratedPitch(null);
    setSubmissionState('idle');
    setCurrentStep(1);
    setProgressValue(0);
    setReferenceId('');
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#161514] antialiased">
      {/* 1. Minimal, High-Trust Header */}
      <header className="border-b border-[#E5E2DC] bg-white px-6 py-4 sticky top-0 z-30 shadow-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#163728] text-[#F9F8F5]">
              <Shield className="w-4 h-4 text-[#F9F8F5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-base font-bold text-[#161514] tracking-tight">
                Submit Pitch to {thesis.firmName}
              </span>
              <span className="text-[11px] text-[#73706A] font-sans">
                Screened by DealFlow AI Gatekeeper
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#73706A]">
              <Lock className="w-3.5 h-3.5 text-[#163728]" />
              <span>Strict Confidentiality NDA</span>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs text-[#73706A] hover:text-[#161514] transition-colors px-2.5 py-1 rounded-md border border-[#E5E2DC] bg-[#F3F1EC] hover:bg-[#EAE8E2]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Partner Desk</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-10 md:py-12">
        {/* SUBMISSION STATE 1: IDLE (THE INTAKE FORM) */}
        {submissionState === 'idle' && (
          <div className="space-y-7">
            {/* Header intro */}
            <div className="text-center space-y-2.5">
              <Badge
                variant="outline"
                className="bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0] text-xs px-2.5 py-0.5 font-financial rounded-md inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#163728]" />
                <span>Dedicated Ingestion Gatekeeper</span>
              </Badge>
              <h1 className="font-editorial text-3xl md:text-4xl font-bold tracking-tight text-[#161514]">
                Submit Pitch to {thesis.firmName}
              </h1>
              <p className="text-xs text-[#73706A] max-w-lg mx-auto leading-relaxed font-sans">
                Direct founder intake gateway. Every deck is evaluated against our active mandate within seconds. High-conviction deals receive partner calendar invitations.
              </p>

              {/* Target Sectors & Mandate Summary Box */}
              <div className="pt-2 max-w-xl mx-auto">
                <div className="p-3 rounded-md bg-white border border-[#E5E2DC] text-left space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#73706A]">
                    <span className="font-semibold uppercase font-sans tracking-wider text-[#161514] flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#163728]" />
                      <span>{thesis.firmName} Target Mandate</span>
                    </span>
                    <span className="font-financial font-medium text-[#163728]">
                      Stage: {thesis.preferredStage}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {thesis.targetSectors.map((sec) => (
                      <Badge
                        key={sec}
                        className="bg-[#F3F1EC] text-[#161514] border-[#E5E2DC] text-[11px] px-2 py-0.5 rounded-md font-medium shadow-none"
                      >
                        {sec}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-[10px] text-[#73706A] font-financial border-t border-[#E5E2DC] pt-1.5 flex items-center justify-between">
                    <span>Min Monthly Rev: ${thesis.minMonthlyRev.toLocaleString()}/mo</span>
                    <span>Max Valuation: ${(thesis.maxValuation / 1_000_000).toFixed(1)}M Cap</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card (Sharp 6px corners, no heavy shadow) */}
            <Card className="bg-white border border-[#E5E2DC] p-6 md:p-8 rounded-md shadow-none">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Section 1: Company & Founder Basics */}
                  <div className="space-y-4">
                    <div className="border-b border-[#E5E2DC] pb-2">
                      <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#73706A]">
                        1. Founder & Startup Identity
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Startup Name */}
                      <FormField
                        control={form.control}
                        name="startupName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#161514]">
                              Startup Name *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. NeuralShield AI"
                                className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Founder Names */}
                      <FormField
                        control={form.control}
                        name="founderNames"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#161514]">
                              Founder Name(s) *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Dr. Elena Rostova & Marcus Vance"
                                className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Tagline */}
                    <FormField
                      control={form.control}
                      name="tagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-[#161514]">
                            One-Line Elevator Pitch / Tagline *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Autonomous runtime defense against LLM prompt injection and API data exfiltration"
                              className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-[11px] text-[#73706A]">
                            10 to 120 characters summarizing your primary software moat.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Work Email */}
                      <FormField
                        control={form.control}
                        name="founderEmail"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-1">
                            <FormLabel className="text-xs font-medium text-[#161514]">
                              Work Email *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="founder@neuralshield.ai"
                                className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Sector */}
                      <FormField
                        control={form.control}
                        name="sector"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-1">
                            <FormLabel className="text-xs font-medium text-[#161514]">
                              Primary Sector *
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full bg-white border-[#E5E2DC] text-xs text-[#161514] focus-visible:border-[#163728] h-9 rounded-md shadow-none">
                                  <SelectValue placeholder="Select Sector" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border-[#E5E2DC] text-[#161514] shadow-none">
                                {thesis.targetSectors.map((sec) => (
                                  <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                                ))}
                                <SelectItem value="FinTech">FinTech</SelectItem>
                                <SelectItem value="HealthTech">HealthTech</SelectItem>
                                <SelectItem value="Other">Other Sector</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Stage */}
                      <FormField
                        control={form.control}
                        name="stage"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-1">
                            <FormLabel className="text-xs font-medium text-[#161514]">
                              Round Stage *
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 2: Financial Metrics */}
                  <div className="space-y-4 pt-1">
                    <div className="border-b border-[#E5E2DC] pb-2">
                      <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#73706A]">
                        2. Round & Financial Metrics
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Reported MRR */}
                      <FormField
                        control={form.control}
                        name="reportedMrr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#161514]">
                              Reported MRR (USD) *
                            </FormLabel>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[#73706A] text-xs font-financial">$</span>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="pl-6 bg-white border-[#E5E2DC] text-xs font-financial text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormDescription className="text-[11px] text-[#73706A] font-financial">
                              {watchedMrr ? `~$${(Number(watchedMrr) * 12 / 1000).toFixed(0)}k ARR` : 'Enter 0 if pre-revenue'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Target Ask */}
                      <FormField
                        control={form.control}
                        name="askAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#161514]">
                              Target Ask / Raise (USD) *
                            </FormLabel>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[#73706A] text-xs font-financial">$</span>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="pl-6 bg-white border-[#E5E2DC] text-xs font-financial text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormDescription className="text-[11px] text-[#73706A] font-financial">
                              {watchedAsk ? `$${(Number(watchedAsk) / 1000000).toFixed(1)}M round size` : 'Target check amount'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Post-Money Valuation */}
                      <FormField
                        control={form.control}
                        name="valuation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-[#161514]">
                              Post-Money Valuation (USD) *
                            </FormLabel>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-[#73706A] text-xs font-financial">$</span>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="pl-6 bg-white border-[#E5E2DC] text-xs font-financial text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormDescription className="text-[11px] text-[#73706A] font-financial">
                              {watchedValuation ? `$${(Number(watchedValuation) / 1000000).toFixed(1)}M cap` : 'Must exceed ask'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section 3: Interactive Drag-and-Drop PDF Upload Zone */}
                  <FormField
                    control={form.control}
                    name="pitchDeck"
                    render={() => (
                      <FormItem className="space-y-3 pt-1">
                        <div className="border-b border-[#E5E2DC] pb-2 flex items-center justify-between">
                          <FormLabel className="text-xs font-sans font-semibold uppercase tracking-wider text-[#73706A]">
                            3. PDF Pitch Deck Upload *
                          </FormLabel>
                          <span className="text-[10px] text-[#163728] font-financial">
                            PDF ONLY • MAX 15MB
                          </span>
                        </div>

                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".pdf,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileSelected(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />

                        {watchedFile instanceof File ? (
                          /* Selected File Card */
                          <div className="p-3.5 rounded-md bg-[#F9F8F5] border border-[#C3DCD0] flex items-center justify-between group transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-md bg-[#E6EFEA] border border-[#C3DCD0] flex items-center justify-center text-[#163728] shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-[#161514] truncate flex items-center gap-2">
                                  <span>{watchedFile.name}</span>
                                  <Badge
                                    variant="outline"
                                    className="bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0] text-[10px] font-financial px-1.5 py-0 rounded"
                                  >
                                    Ready
                                  </Badge>
                                </div>
                                <span className="text-[11px] text-[#73706A] font-financial">
                                  {formatFileSize(watchedFile.size)} • PDF Pitch Deck
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-[#73706A] hover:text-[#161514] hover:bg-[#EAE8E2] h-7 px-2 cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Replace
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => form.setValue('pitchDeck', undefined as any, { shouldValidate: true })}
                                className="text-xs text-[#862820] hover:text-[#862820] hover:bg-[#FAECEB] h-7 px-2 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Dropzone when no file selected */
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                              isDragging
                                ? 'border-[#163728] bg-[#E6EFEA]/30'
                                : 'border-[#D5D2CC] hover:border-[#163728] bg-[#F9F8F5]'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center space-y-2.5">
                              <div className="w-10 h-10 rounded-md bg-white border border-[#E5E2DC] flex items-center justify-center text-[#73706A]">
                                <Upload className="w-5 h-5 text-[#73706A]" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-[#161514]">
                                  <span className="text-[#163728] font-semibold underline">
                                    Click to upload
                                  </span>{' '}
                                  or drag and drop your pitch deck
                                </p>
                                <p className="text-[11px] text-[#73706A] mt-0.5">
                                  PDF format only (up to 15MB)
                                </p>
                              </div>

                              {/* Demo Sample Deck Button */}
                              <div className="pt-0.5">
                                <button
                                  type="button"
                                  onClick={handleLoadSampleDeck}
                                  className="inline-flex items-center gap-1.5 text-[11px] text-[#73706A] hover:text-[#163728] bg-white border border-[#E5E2DC] hover:border-[#C3DCD0] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                                >
                                  <FileUp className="w-3 h-3 text-[#163728]" />
                                  <span>Or attach demo sample deck (.pdf)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Action */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submitPitchMutation.isPending}
                      className="w-full bg-[#163728] hover:bg-[#10291e] text-[#F9F8F5] font-medium py-3 rounded-md flex items-center justify-center gap-2 shadow-none transition-all cursor-pointer text-xs disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Pitch Deck for {thesis.firmName} AI Review</span>
                    </Button>
                    <p className="text-center text-[11px] text-[#73706A] mt-2.5">
                      By submitting, your deck is cryptographically indexed and audited under {thesis.firmName} confidentiality terms.
                    </p>
                  </div>
                </form>
              </Form>
            </Card>
          </div>
        )}

        {/* SUBMISSION STATE 2: SIMULATED PROCESSING ANIMATION */}
        {submissionState === 'processing' && (
          <div className="py-12 max-w-lg mx-auto">
            <Card className="bg-white border border-[#E5E2DC] p-7 rounded-md shadow-none text-center space-y-5">
              {/* Central Status Icon */}
              <div className="w-12 h-12 rounded-md bg-[#E6EFEA] border border-[#C3DCD0] flex items-center justify-center text-[#163728] mx-auto">
                <Shield className="w-6 h-6 text-[#163728]" />
              </div>

              <div>
                <h2 className="font-editorial text-xl font-bold text-[#161514] tracking-tight">
                  DealFlow AI Gatekeeper Active
                </h2>
                <p className="text-xs text-[#73706A] mt-1 font-financial">
                  Evaluating {form.getValues('startupName') || 'Pitch Deck'} against {thesis.firmName} Thesis
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <Progress
                  value={progressValue}
                  className="w-full h-1.5 rounded-full [&_[data-slot=progress-track]]:bg-[#E5E2DC] [&_[data-slot=progress-indicator]]:bg-[#163728]"
                />
                <div className="flex justify-between items-center text-xs font-financial text-[#73706A]">
                  <span>Processing Dossier</span>
                  <span className="text-[#163728] font-bold">{progressValue}%</span>
                </div>
              </div>

              {/* Multi-Step Checklist */}
              <div className="space-y-2 text-left pt-1">
                {/* Step 1 */}
                <div className={`p-2.5 rounded-md border text-xs flex items-center justify-between transition-all ${
                  currentStep > 1 
                    ? 'bg-[#E6EFEA]/50 border-[#C3DCD0] text-[#1A422F]' 
                    : currentStep === 1 
                    ? 'bg-white border-[#163728] text-[#161514]' 
                    : 'bg-[#F9F8F5] border-[#E5E2DC] text-[#A5A29C]'
                }`}>
                  <div className="flex items-center gap-2">
                    {currentStep > 1 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#163728] shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-[#163728] border-t-transparent animate-spin shrink-0" />
                    )}
                    <span>Step 1: Extracting text & financial tables from PDF...</span>
                  </div>
                  <span className="font-financial text-[10px] text-[#73706A]">
                    {currentStep > 1 ? 'DONE' : 'PARSING'}
                  </span>
                </div>

                {/* Step 2 */}
                <div className={`p-2.5 rounded-md border text-xs flex items-center justify-between transition-all ${
                  currentStep > 2 
                    ? 'bg-[#E6EFEA]/50 border-[#C3DCD0] text-[#1A422F]' 
                    : currentStep === 2 
                    ? 'bg-white border-[#163728] text-[#161514]' 
                    : 'bg-[#F9F8F5] border-[#E5E2DC] text-[#A5A29C]'
                }`}>
                  <div className="flex items-center gap-2">
                    {currentStep > 2 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#163728] shrink-0" />
                    ) : currentStep === 2 ? (
                      <span className="w-3.5 h-3.5 rounded-full border border-[#163728] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-[#A5A29C] shrink-0" />
                    )}
                    <span>Step 2: Cross-referencing against {thesis.firmName} thesis...</span>
                  </div>
                  <span className="font-financial text-[10px] text-[#73706A]">
                    {currentStep > 2 ? 'DONE' : currentStep === 2 ? 'EVALUATING' : 'PENDING'}
                  </span>
                </div>

                {/* Step 3 */}
                <div className={`p-2.5 rounded-md border text-xs flex items-center justify-between transition-all ${
                  currentStep >= 3 && progressValue === 100
                    ? 'bg-[#E6EFEA]/50 border-[#C3DCD0] text-[#1A422F]' 
                    : currentStep === 3 
                    ? 'bg-white border-[#163728] text-[#161514]' 
                    : 'bg-[#F9F8F5] border-[#E5E2DC] text-[#A5A29C]'
                }`}>
                  <div className="flex items-center gap-2">
                    {progressValue === 100 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#163728] shrink-0" />
                    ) : currentStep === 3 ? (
                      <span className="w-3.5 h-3.5 rounded-full border border-[#163728] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-[#A5A29C] shrink-0" />
                    )}
                    <span>Step 3: Generating partner brief & score...</span>
                  </div>
                  <span className="font-financial text-[10px] text-[#73706A]">
                    {progressValue === 100 ? 'DONE' : currentStep === 3 ? 'SYNTHESIZING' : 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#73706A] font-financial">
                Pipeline execution latency: ~2.4s
              </div>
            </Card>
          </div>
        )}

        {/* SUBMISSION STATE 3: PROFESSIONAL CONFIRMATION SCREEN */}
        {submissionState === 'completed' && (
          <div className="py-8 max-w-lg mx-auto space-y-5">
            <Card className="bg-white border border-[#E5E2DC] p-7 rounded-md shadow-none text-center space-y-5">
              {/* Green Success Badge */}
              <div className="w-12 h-12 rounded-md bg-[#E6EFEA] border border-[#C3DCD0] flex items-center justify-center text-[#163728] mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#163728]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0] text-xs font-financial px-2.5 py-0.5 rounded-md"
                  >
                    Screening Complete
                  </Badge>
                  {generatedPitch && (
                    <Badge
                      variant="outline"
                      className={`text-xs font-financial font-bold px-2.5 py-0.5 rounded-md ${
                        generatedPitch.matchScore >= 85
                          ? 'bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0]'
                          : generatedPitch.matchScore >= 60
                          ? 'bg-[#FAF4E8] text-[#7E4812] border-[#EBDCBE]'
                          : 'bg-[#FAECEB] text-[#862820] border-[#F1C9C5]'
                      }`}
                    >
                      Score: {generatedPitch.matchScore}/100
                    </Badge>
                  )}
                </div>

                <h2 className="font-editorial text-2xl font-bold text-[#161514] tracking-tight pt-1">
                  Pitch Dossier Received & Audited
                </h2>
                <p className="text-xs text-[#73706A] max-w-md mx-auto leading-relaxed">
                  Thank you for submitting <strong className="text-[#161514]">{form.getValues('startupName')}</strong> to <strong className="text-[#161514]">{thesis.firmName}</strong>. The DealFlow AI Gatekeeper has parsed your metrics and generated your thesis evaluation brief.
                </p>
              </div>

              {/* Reference ID Pill */}
              <div className="p-3 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-financial uppercase tracking-wider text-[#73706A] block">
                    Submission Reference ID
                  </span>
                  <span className="text-sm font-financial font-bold text-[#163728]">
                    {referenceId}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyRef}
                  className="text-xs text-[#73706A] hover:text-[#161514] hover:bg-white h-7 px-2.5 gap-1.5 cursor-pointer rounded-md border border-[#E5E2DC]"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3 h-3 text-[#163728]" />
                      <span className="text-[#163728]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy ID</span>
                    </>
                  )}
                </Button>
              </div>

              {/* AI Gatekeeper Synthesis Highlights */}
              {generatedPitch && (
                <div className="p-3.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] text-left text-xs space-y-2">
                  <span className="text-[10px] text-[#73706A] uppercase font-financial tracking-wider block">
                    Automated Gatekeeper Synthesis
                  </span>
                  <p className="text-xs text-[#161514] leading-relaxed">
                    {generatedPitch.summary}
                  </p>
                  {generatedPitch.pros.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {generatedPitch.pros.slice(0, 2).map((pro, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#1A422F]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1A422F] mt-1 shrink-0" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submission Summary Details */}
              <div className="grid grid-cols-2 gap-3 text-left p-3.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] text-xs">
                <div>
                  <span className="text-[10px] text-[#73706A] uppercase font-financial block">Recipient Institution</span>
                  <div className="font-semibold text-[#161514] truncate mt-0.5">{thesis.firmName}</div>
                  <div className="text-[11px] text-[#73706A] truncate">Slug: /{thesis.slug}</div>
                </div>

                <div>
                  <span className="text-[10px] text-[#73706A] uppercase font-financial block">Sector & Raise</span>
                  <div className="font-semibold text-[#161514] mt-0.5">{form.getValues('sector')}</div>
                  <div className="text-[11px] text-[#163728] font-financial">
                    Ask: ${Number(form.getValues('askAmount') || 0).toLocaleString()}
                  </div>
                </div>

                <div className="col-span-2 pt-2 border-t border-[#E5E2DC] flex items-center justify-between">
                  <span className="text-[11px] text-[#73706A] flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#163728]" />
                    <span>{watchedFile instanceof File ? watchedFile.name : 'pitch_deck.pdf'}</span>
                  </span>
                  <span className="text-[11px] font-financial text-[#73706A]">
                    {watchedFile instanceof File ? formatFileSize(watchedFile.size) : 'PDF Pitch Deck'}
                  </span>
                </div>
              </div>

              {/* Next steps notice */}
              <div className="p-3.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] text-xs text-[#73706A] text-left space-y-1 leading-relaxed">
                <span className="text-[#161514] font-semibold block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#163728]" /> Next Steps:
                </span>
                <p>
                  1. High-scoring pitches (<span className="text-[#163728] font-semibold">Top 1%</span>) trigger direct partner diligence requests from {thesis.firmName} within <strong>24–48 hours</strong>.
                </p>
                <p>
                  2. Detailed automated thesis feedback is logged under reference ID <strong className="font-financial text-[#161514]">{referenceId}</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Button
                  onClick={handleResetForm}
                  variant="outline"
                  className="flex-1 border-[#E5E2DC] bg-white text-[#161514] hover:bg-[#F3F1EC] text-xs py-2 rounded-md cursor-pointer shadow-none"
                >
                  Submit Another Pitch
                </Button>

                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full bg-[#163728] hover:bg-[#10291e] text-[#F9F8F5] font-medium text-xs py-2 rounded-md flex items-center justify-center gap-1.5 cursor-pointer shadow-none">
                    <span>View in Deal Flow Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
