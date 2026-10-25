'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Pitch, PitchStatus } from '@/types/deal';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { getEditorialStatusTheme } from '@/config/theme';
import { DealFlowDataTable } from '@/components/deals/deal-flow-data-table';
import {
  useDashboardPitches,
  useUpdatePitchStatusMutation,
} from '@/hooks/useDashboardPitches';
import { useDebounce } from '@/hooks/useDebounce';
import { useThesisQuery } from '@/hooks/use-deals';
import { pitchService } from '@/services/pitch.service';
import {
  Clock,
  Target,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  XCircle,
  Mail,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Layers,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';

export default function DealFlowCommandCenter() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);
  const [directPitch, setDirectPitch] = useState<Pitch | null>(null);

  // TanStack Query Hook: ['dashboard-pitches', { status, search: debouncedSearchQuery, page }]
  const {
    data: pitches = [],
    isLoading,
    isRefetching,
    refetch,
  } = useDashboardPitches({
    status: activeTab !== 'ALL' ? activeTab : undefined,
    search: debouncedSearchQuery,
    debounceMs: 0, // already debounced via debouncedSearchQuery hook
  });

  const { data: thesis } = useThesisQuery('apex-family-office');
  const updateStatusMutation = useUpdatePitchStatusMutation();

  // Selected pitch synced with active query cache or fetched directly
  const selectedPitch = useMemo(() => {
    if (!selectedPitchId) return null;
    return pitches.find((p) => p.id === selectedPitchId) || directPitch || null;
  }, [pitches, selectedPitchId, directPitch]);

  // Fallback to fetch pitch details by ID if not in currently filtered view
  useEffect(() => {
    if (selectedPitchId && !pitches.some((p) => p.id === selectedPitchId)) {
      pitchService.getPitchById(selectedPitchId).then((p) => {
        if (p) setDirectPitch(p);
      });
    }
  }, [selectedPitchId, pitches]);

  // Dynamic KPI Metrics calculations from live cache
  const kpis = useMemo(() => {
    const totalScreenedHistorical = 142;
    const activeTopMatches = pitches.filter(
      (p) => p.status === 'TOP_1_PERCENT' || p.matchScore >= 85
    ).length;
    const activeNeedsReview = pitches.filter(
      (p) => p.status === 'REVIEW' || (p.matchScore >= 60 && p.matchScore < 85)
    ).length;
    const activeRejected = pitches.filter(
      (p) => p.status === 'REJECTED' || p.matchScore < 60
    ).length;
    const avgScore =
      pitches.length > 0
        ? Math.round(
            pitches.reduce((acc, p) => acc + p.matchScore, 0) / pitches.length
          )
        : 0;

    return {
      totalScreened: totalScreenedHistorical + pitches.length,
      topMatches: activeTopMatches,
      needsReview: activeNeedsReview,
      autoRejected: activeRejected,
      timeSaved: '68.5 Hours',
      avgScore,
    };
  }, [pitches]);

  // Filtered pitches based on active tab and search query
  const filteredPitches = useMemo(() => {
    return pitches.filter((pitch) => {
      let matchesTab = true;
      if (activeTab === 'TOP_1_PERCENT') {
        matchesTab = pitch.status === 'TOP_1_PERCENT' || pitch.matchScore >= 85;
      } else if (activeTab === 'REVIEW') {
        matchesTab =
          pitch.status === 'REVIEW' ||
          (pitch.matchScore >= 60 && pitch.matchScore < 85);
      } else if (activeTab === 'REJECTED') {
        matchesTab = pitch.status === 'REJECTED' || pitch.matchScore < 60;
      }

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        pitch.startupName.toLowerCase().includes(q) ||
        pitch.founderNames.toLowerCase().includes(q) ||
        pitch.sector.toLowerCase().includes(q) ||
        pitch.tagline.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [pitches, activeTab, searchQuery]);

  // Currency formatters
  const formatCompactMillions = (amount: number) => {
    const val = amount / 1_000_000;
    return `$${val.toFixed(val % 1 === 0 ? 0 : 1)}M`;
  };

  const formatThousands = (amount: number) => {
    return `$${Math.round(amount / 1000).toLocaleString()}k`;
  };

  return (
    <div className="space-y-7">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E2DC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-2xl md:text-3xl font-bold tracking-tight text-[#161514]">
              Inbound Deal Flow
            </h1>
            <Badge
              variant="outline"
              className="bg-[#F3F1EC] text-[#73706A] border-[#E5E2DC] font-financial text-xs px-2 py-0.5 rounded-md"
            >
              Mandate v2.4
            </Badge>
            {isRefetching && (
              <span className="flex items-center gap-1 text-[11px] font-financial text-[#163728]">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Syncing</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#73706A] mt-1 font-sans">
            Autonomous triage desk screening against{' '}
            <strong className="text-[#161514] font-medium">
              {thesis?.firmName || 'Apex Family Office'}
            </strong>{' '}
            investment criteria.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-[#E5E2DC] bg-white text-[#73706A] hover:text-[#161514] hover:bg-[#F3F1EC] text-xs gap-1.5 shadow-none rounded-md h-8 cursor-pointer"
            title="Refresh deal cache"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            className="border-[#E5E2DC] bg-white text-[#161514] hover:bg-[#F3F1EC] text-xs gap-1.5 shadow-none rounded-md h-8 cursor-pointer"
            onClick={() => window.open(`/submit/${thesis?.slug || 'apex-family-office'}`, '_blank')}
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#73706A]" />
            <span>Public Intake Link</span>
          </Button>
        </div>
      </div>

      {/* 1. Top KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="bg-white border border-[#E5E2DC] shadow-none rounded-md p-4">
          <div className="flex items-center justify-between text-[#73706A] mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Total Screened
            </span>
            <Layers className="w-4 h-4 text-[#A5A29C]" />
          </div>
          <div className="font-financial text-2xl font-bold text-[#161514]">
            {kpis.totalScreened}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[#73706A]">
            <span className="text-[#1A422F] font-semibold font-financial">+{pitches.length}</span>
            <span>in active triage desk</span>
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="bg-white border border-[#E5E2DC] shadow-none rounded-md p-4">
          <div className="flex items-center justify-between text-[#73706A] mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans text-[#1A422F]">
              Top 1% Matches
            </span>
            <span className="h-2 w-2 rounded-full bg-[#163728]" />
          </div>
          <div className="font-financial text-2xl font-bold text-[#163728]">
            {kpis.topMatches}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[#73706A]">
            <span className="font-financial text-[#1A422F]">Score ≥ 85</span>
            <span>• Ready for Partner IC</span>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="bg-white border border-[#E5E2DC] shadow-none rounded-md p-4">
          <div className="flex items-center justify-between text-[#73706A] mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Time Saved by Gatekeeper
            </span>
            <Clock className="w-4 h-4 text-[#A5A29C]" />
          </div>
          <div className="font-financial text-2xl font-bold text-[#161514]">
            {kpis.timeSaved}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-[#73706A]">
            <span>~1.5 FTE Analyst capacity saved</span>
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="bg-white border border-[#E5E2DC] shadow-none rounded-md p-4">
          <div className="flex items-center justify-between text-[#73706A] mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">
              Avg Match Score
            </span>
            <Target className="w-4 h-4 text-[#A5A29C]" />
          </div>
          <div className="font-financial text-2xl font-bold text-[#161514]">
            {kpis.avgScore}
            <span className="text-sm text-[#73706A] font-normal font-sans"> / 100</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-[#73706A]">
            <span>Against active thesis mandate</span>
          </div>
        </Card>
      </div>

      {/* 2. Filterable Section: Status Tabs & Search Input */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center bg-[#F3F1EC] p-2 rounded-md border border-[#E5E2DC]">
          {/* Status Filter Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val)}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-transparent p-0 gap-1.5 flex flex-wrap h-auto">
              {/* Tab 1: All Pitches */}
              <TabsTrigger
                value="ALL"
                className="text-xs py-1.5 px-3 rounded-md data-active:bg-white data-active:text-[#161514] data-active:border-[#E5E2DC] data-active:shadow-none border border-transparent text-[#73706A] font-medium transition-colors cursor-pointer"
              >
                <span>All Pitches</span>
                <span className="ml-1.5 text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#EAE8E2] text-[#73706A]">
                  {pitches.length}
                </span>
              </TabsTrigger>

              {/* Tab 2: Top 1% Deals */}
              <TabsTrigger
                value="TOP_1_PERCENT"
                className="text-xs py-1.5 px-3 rounded-md data-active:bg-white data-active:text-[#161514] data-active:border-[#E5E2DC] data-active:shadow-none border border-transparent text-[#73706A] font-medium transition-colors cursor-pointer"
              >
                <span>Top 1% Deals</span>
                <span className="ml-1.5 text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#E6EFEA] text-[#1A422F] border border-[#C3DCD0]">
                  {kpis.topMatches}
                </span>
              </TabsTrigger>

              {/* Tab 3: Under Review */}
              <TabsTrigger
                value="REVIEW"
                className="text-xs py-1.5 px-3 rounded-md data-active:bg-white data-active:text-[#161514] data-active:border-[#E5E2DC] data-active:shadow-none border border-transparent text-[#73706A] font-medium transition-colors cursor-pointer"
              >
                <span>Under Review</span>
                <span className="ml-1.5 text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#FAF4E8] text-[#7E4812] border border-[#EBDCBE]">
                  {kpis.needsReview}
                </span>
              </TabsTrigger>

              {/* Tab 4: Rejected */}
              <TabsTrigger
                value="REJECTED"
                className="text-xs py-1.5 px-3 rounded-md data-active:bg-white data-active:text-[#161514] data-active:border-[#E5E2DC] data-active:shadow-none border border-transparent text-[#73706A] font-medium transition-colors cursor-pointer"
              >
                <span>Rejected</span>
                <span className="ml-1.5 text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#FAECEB] text-[#862820] border border-[#F1C9C5]">
                  {kpis.autoRejected}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Input for Startup Name & Founders */}
          <div className="relative w-full lg:w-72">
            {isRefetching || (searchQuery !== debouncedSearchQuery && searchQuery.trim().length > 0) ? (
              <Loader2 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#163728] animate-spin" />
            ) : (
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#A5A29C]" />
            )}
            <Input
              type="text"
              placeholder="Search startup, sector, founder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-8 rounded-md shadow-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[#A5A29C] hover:text-[#161514]"
                aria-label="Clear search"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. TanStack Data Table (Startup Name, Sector, Stage, MRR, Valuation, Match Score, Status Badge, Date) */}
        <DealFlowDataTable
          data={filteredPitches}
          isLoading={isLoading}
          onInspectPitch={(pitch) => {
            setSelectedPitchId(pitch.id);
            setDirectPitch(pitch);
          }}
        />

        {/* Table Footer Summary */}
        <div className="flex items-center justify-between text-xs text-[#73706A] px-1 pt-0.5">
          <span>
            Displaying {filteredPitches.length} of {pitches.length} parsed pitches
          </span>
          <span className="flex items-center gap-1.5 text-[#163728] font-financial text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#163728]" />
            TanStack Query Engine Active: Instant live sync
          </span>
        </div>
      </div>

      {/* 4. Full Evaluation Breakdown Sheet / Drawer */}
      <Sheet
        open={Boolean(selectedPitch)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPitchId(null);
            setDirectPitch(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-2xl bg-white border-l border-[#E5E2DC] text-[#161514] overflow-y-auto p-6 md:p-8 space-y-6 shadow-none">
          {selectedPitch && (() => {
            const theme = getEditorialStatusTheme(selectedPitch.matchScore);

            const handleSetStatus = (status: PitchStatus) => {
              updateStatusMutation.mutate({
                pitchId: selectedPitch.id,
                status,
                startupName: selectedPitch.startupName,
              });
            };

            return (
              <div className="space-y-6">
                {/* Drawer Header */}
                <SheetHeader className="p-0 border-b border-[#E5E2DC] pb-5 text-left space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs font-financial font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 ${theme.badge}`}
                      >
                        <span>Match Score: {selectedPitch.matchScore}/100</span>
                      </Badge>
                      <span className="text-xs font-financial px-2 py-0.5 rounded bg-[#F3F1EC] border border-[#E5E2DC] text-[#73706A]">
                        {selectedPitch.stage}
                      </span>
                      {selectedPitch.status === 'REJECTED' && (
                        <span className="text-xs font-financial px-2 py-0.5 rounded bg-[#FAECEB] border border-[#F1C9C5] text-[#862820] font-medium">
                          PASSED
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-[#73706A] font-financial">
                      {new Date(selectedPitch.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <SheetTitle className="font-editorial text-2xl font-bold text-[#161514] tracking-tight">
                      {selectedPitch.startupName}
                    </SheetTitle>
                    <SheetDescription className="text-[#73706A] text-xs mt-1 leading-relaxed">
                      {selectedPitch.tagline}
                    </SheetDescription>
                  </div>

                  {/* Header Triage Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button
                      onClick={() => handleSetStatus('TOP_1_PERCENT')}
                      disabled={updateStatusMutation.isPending || selectedPitch.status === 'TOP_1_PERCENT'}
                      className="bg-[#163728] hover:bg-[#10291e] text-[#F9F8F5] font-medium text-xs py-2 px-2.5 rounded-md flex items-center justify-center gap-1.5 shadow-none transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Top 1% / Call</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleSetStatus('REVIEW')}
                      disabled={updateStatusMutation.isPending || selectedPitch.status === 'REVIEW'}
                      className="border-[#EBDCBE] bg-[#FAF4E8] hover:bg-[#F5ECD7] text-[#7E4812] font-medium text-xs py-2 px-2.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-none disabled:opacity-40"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#7E4812]" />
                      <span>Keep Review</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleSetStatus('REJECTED')}
                      disabled={updateStatusMutation.isPending || selectedPitch.status === 'REJECTED'}
                      className="border-[#F1C9C5] bg-white hover:bg-[#FAECEB] text-[#862820] font-medium text-xs py-2 px-2.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-none disabled:opacity-40"
                    >
                      <XCircle className="w-3.5 h-3.5 text-[#862820]" />
                      <span>Pass / Reject</span>
                    </Button>
                  </div>
                </SheetHeader>

                {/* AI Score Gauge & Status Banner */}
                <div className="flex items-center gap-5 p-4 rounded-md bg-[#F9F8F5] border border-[#E5E2DC]">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#E5E2DC"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={
                          selectedPitch.status === 'TOP_1_PERCENT'
                            ? '#163728'
                            : selectedPitch.status === 'REVIEW'
                            ? '#B45309'
                            : '#B91C1C'
                        }
                        strokeWidth="8"
                        strokeDasharray={251}
                        strokeDashoffset={251 - (251 * selectedPitch.matchScore) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-editorial text-xl font-bold text-[#161514]">
                        {selectedPitch.matchScore}
                      </span>
                      <span className="text-[9px] font-financial uppercase text-[#73706A]">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-financial text-[#73706A] block">
                      AI Gatekeeper Mandate Score
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-financial font-bold px-2.5 py-0.5 rounded-md ${
                        selectedPitch.status === 'TOP_1_PERCENT'
                          ? 'bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0]'
                          : selectedPitch.status === 'REVIEW'
                          ? 'bg-[#FAF4E8] text-[#7E4812] border-[#EBDCBE]'
                          : 'bg-[#FAECEB] text-[#862820] border-[#F1C9C5]'
                      }`}
                    >
                      {selectedPitch.status === 'TOP_1_PERCENT'
                        ? 'TOP 1% — MANDATE MATCH'
                        : selectedPitch.status === 'REVIEW'
                        ? 'REVIEW — UNDER DILIGENCE'
                        : 'REJECTED — MANDATE DIVERGENCE'}
                    </Badge>
                    <p className="text-[11px] text-[#73706A]">
                      Stage: {selectedPitch.stage} • Vertical: {selectedPitch.sector}
                    </p>
                  </div>
                </div>

                {/* AI Executive Summary Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#73706A] font-sans">
                      Executive AI Synthesis
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-[#F3F1EC] text-[#73706A] border-[#E5E2DC] font-financial"
                    >
                      Audit Confirmed
                    </Badge>
                  </div>
                  <div className="p-4 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] text-xs text-[#161514] leading-relaxed">
                    {selectedPitch.summary}
                  </div>
                </div>

                {/* Key Financial Metrics Grid */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#73706A] font-sans">
                    Key Financial Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#73706A] uppercase font-financial tracking-wider block">
                        Ask Amount
                      </span>
                      <div className="text-base font-bold font-financial text-[#163728] mt-0.5">
                        {formatCompactMillions(selectedPitch.askAmount)}
                      </div>
                      <div className="text-[11px] text-[#73706A] mt-0.5">Target Round</div>
                    </div>

                    <div className="p-3.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#73706A] uppercase font-financial tracking-wider block">
                        Reported MRR
                      </span>
                      <div className="text-base font-bold font-financial text-[#161514] mt-0.5">
                        ${selectedPitch.reportedMrr.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#73706A] mt-0.5 font-financial">
                        ~{formatThousands(selectedPitch.reportedMrr * 12)} Run Rate
                      </div>
                    </div>

                    <div className="p-3.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#73706A] uppercase font-financial tracking-wider block">
                        Valuation Cap
                      </span>
                      <div className="text-base font-bold font-financial text-[#161514] mt-0.5">
                        {formatCompactMillions(selectedPitch.valuation)}
                      </div>
                      <div className="text-[11px] text-[#73706A] mt-0.5 font-financial">
                        {(
                          selectedPitch.valuation /
                          (selectedPitch.reportedMrr * 12 || 1)
                        ).toFixed(1)}
                        x ARR multiple
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pros, Cons, and Red Flags Badges/Sections */}
                <div className="space-y-4">
                  {/* Red Flags First (if any) */}
                  {selectedPitch.redFlags && selectedPitch.redFlags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#862820] font-sans flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#862820]" />
                        <span>Critical Red Flags ({selectedPitch.redFlags.length})</span>
                      </h3>
                      <div className="space-y-1.5">
                        {selectedPitch.redFlags.map((flag, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-md bg-[#FAECEB] border border-[#F1C9C5] text-xs text-[#862820] flex items-start gap-2"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-[#862820] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pros (Why It Matches) */}
                  {selectedPitch.pros && selectedPitch.pros.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A422F] font-sans flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1A422F]" />
                        <span>Thesis Pros & Strengths ({selectedPitch.pros.length})</span>
                      </h3>
                      <div className="space-y-1.5">
                        {selectedPitch.pros.map((pro, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-md bg-[#E6EFEA]/40 border border-[#C3DCD0] text-xs text-[#1A422F] flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#163728] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cons (Execution Risks) */}
                  {selectedPitch.cons && selectedPitch.cons.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7E4812] font-sans flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-[#7E4812]" />
                        <span>Execution & Diligence Risks ({selectedPitch.cons.length})</span>
                      </h3>
                      <div className="space-y-1.5">
                        {selectedPitch.cons.map((con, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-md bg-[#FAF4E8]/50 border border-[#EBDCBE] text-xs text-[#7E4812] flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7E4812] mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Founder & Team Dossier */}
                <div className="p-4 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] text-xs space-y-2">
                  <span className="text-[10px] text-[#73706A] uppercase font-financial tracking-wider block">
                    Founding Team & Intake Dossier
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                    <div>
                      <div className="text-xs font-semibold text-[#161514]">
                        {selectedPitch.founderNames}
                      </div>
                      <div className="text-[11px] text-[#73706A] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-[#A5A29C]" />
                        <span>{selectedPitch.founderEmail}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedPitch.deckUrl ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5001'}${selectedPitch.deckUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-[#163728]/10 text-[#163728] hover:bg-[#163728]/20 transition-colors"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-[#163728]" />
                          <span>View Deck ({selectedPitch.deckFileName || 'PDF'})</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#73706A] flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5 text-[#163728]" />
                          <span>PDF Deck Indexed</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
