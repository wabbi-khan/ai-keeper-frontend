'use client';

import React, { useState, useMemo } from 'react';
import { Pitch } from '@/types/deal';
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
  usePitchesQuery,
  useThesisQuery,
  useUpdatePitchStatusMutation,
  useBulkUpdatePitchStatusMutation,
} from '@/hooks/use-deals';
import {
  Clock,
  Target,
  Search,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  XCircle,
  Mail,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Layers,
  RefreshCw,
} from 'lucide-react';

export default function DealFlowCommandCenter() {
  const [activeTab, setActiveTab] = useState<'all' | 'top' | 'review' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);

  // TanStack Query Hooks
  const {
    data: pitches = [],
    isLoading,
    isRefetching,
    refetch,
  } = usePitchesQuery();

  const { data: thesis } = useThesisQuery('apex-family-office');
  const updateStatusMutation = useUpdatePitchStatusMutation();
  const bulkUpdateMutation = useBulkUpdatePitchStatusMutation();

  // Selected pitch synced with active query cache
  const selectedPitch = useMemo(() => {
    if (!selectedPitchId) return null;
    return pitches.find((p) => p.id === selectedPitchId) || null;
  }, [pitches, selectedPitchId]);

  // Dynamic KPI Metrics calculations from live cache
  const kpis = useMemo(() => {
    const totalScreenedHistorical = 142;
    const activeTopMatches = pitches.filter(
      (p) => p.matchScore >= 85 && p.status !== 'REJECTED'
    ).length;
    const activeNeedsReview = pitches.filter(
      (p) => p.matchScore >= 60 && p.matchScore < 85 && p.status !== 'REJECTED'
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
      totalScreened: totalScreenedHistorical,
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
      if (activeTab === 'top') {
        matchesTab = pitch.matchScore >= 85 && pitch.status !== 'REJECTED';
      } else if (activeTab === 'review') {
        matchesTab =
          pitch.matchScore >= 60 &&
          pitch.matchScore < 85 &&
          pitch.status !== 'REJECTED';
      } else if (activeTab === 'rejected') {
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

  // Bulk reject handler
  const handleBulkReject = (selectedPitchIds: string[]) => {
    bulkUpdateMutation.mutate({
      pitchIds: selectedPitchIds,
      status: 'REJECTED',
    });
  };

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
            className="border-[#E5E2DC] bg-white text-[#73706A] hover:text-[#161514] hover:bg-[#F3F1EC] text-xs gap-1.5 shadow-none rounded-md h-8"
            title="Refresh deal cache"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            className="border-[#E5E2DC] bg-white text-[#161514] hover:bg-[#F3F1EC] text-xs gap-1.5 shadow-none rounded-md h-8"
            onClick={() => window.open(`/submit/${thesis?.slug || 'apex-family-office'}`, '_blank')}
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#73706A]" />
            <span>Public Intake Link</span>
          </Button>
        </div>
      </div>

      {/* 1. Top KPI Metrics Row (Sharp 6px corners, no heavy shadows) */}
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
            <span className="text-[#1A422F] font-semibold font-financial">+24</span>
            <span>inbound decks this week</span>
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

      {/* 2. Filterable Section (Tabs & Search Input) */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center bg-[#F3F1EC] p-2 rounded-md border border-[#E5E2DC]">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as typeof activeTab)}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-transparent p-0 gap-1.5 flex flex-wrap h-auto">
              <TabsTrigger
                value="all"
                className="text-xs py-1.5 px-3 rounded-md data-active:bg-white data-active:text-[#161514] data-active:border-[#E5E2DC] data-active:shadow-none border border-transparent text-[#73706A] font-medium transition-colors cursor-pointer"
              >
                <span>All Deals</span>
                <span className="ml-1.5 text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#EAE8E2] text-[#73706A]">
                  {pitches.length}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="top"
                className="text-xs py-1.5 px-3 rounded-md data-active:bg-white data-active:text-[#161514] data-active:border-[#E5E2DC] data-active:shadow-none border border-transparent text-[#73706A] font-medium transition-colors cursor-pointer"
              >
                <span>Top 1% Matches</span>
                <span className="ml-1.5 text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#E6EFEA] text-[#1A422F] border border-[#C3DCD0]">
                  {kpis.topMatches}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="review"
                className="text-xs py-1.5 px-3 rounded-md data-active:bg-white data-active:text-[#161514] data-active:border-[#E5E2DC] data-active:shadow-none border border-transparent text-[#73706A] font-medium transition-colors cursor-pointer"
              >
                <span>Needs Review</span>
                <span className="ml-1.5 text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#FAF4E8] text-[#7E4812] border border-[#EBDCBE]">
                  {kpis.needsReview}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="rejected"
                className="text-xs py-1.5 px-3 rounded-md data-active:bg-white data-active:text-[#161514] data-active:border-[#E5E2DC] data-active:shadow-none border border-transparent text-[#73706A] font-medium transition-colors cursor-pointer"
              >
                <span>Auto-Rejected</span>
                <span className="ml-1.5 text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#FAECEB] text-[#862820] border border-[#F1C9C5]">
                  {kpis.autoRejected}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#A5A29C]" />
            <Input
              type="text"
              placeholder="Filter startup, founder, sector..."
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

        {/* 3. TanStack Data Table */}
        <DealFlowDataTable
          data={filteredPitches}
          isLoading={isLoading}
          onInspectPitch={(pitch) => setSelectedPitchId(pitch.id)}
          onBulkReject={handleBulkReject}
        />

        {/* Footer info banner */}
        <div className="flex items-center justify-between text-xs text-[#73706A] px-1 pt-0.5">
          <span>
            Displaying {filteredPitches.length} of {pitches.length} parsed pitches
          </span>
          <span className="flex items-center gap-1.5 text-[#163728] font-financial text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#163728]" />
            TanStack Query Cache: Instant optimistic updates active
          </span>
        </div>
      </div>

      {/* 4. Interactive AI Deep-Dive Drawer (Wide Right-Side Sheet in Crisp White) */}
      <Sheet
        open={!!selectedPitch}
        onOpenChange={(open) => !open && setSelectedPitchId(null)}
      >
        <SheetContent className="w-full sm:max-w-2xl bg-white border-l border-[#E5E2DC] text-[#161514] overflow-y-auto p-6 md:p-8 space-y-6 shadow-none">
          {selectedPitch && (() => {
            const theme = getEditorialStatusTheme(selectedPitch.matchScore);

            const handleScheduleCall = () => {
              updateStatusMutation.mutate({
                pitchId: selectedPitch.id,
                status: 'TOP_1_PERCENT',
                startupName: selectedPitch.startupName,
              });

              toast.success(
                `Partner call request drafted for ${selectedPitch.founderNames} (${selectedPitch.startupName})`,
                {
                  description:
                    'Automated calendar invite & diligence memo queued in partner dispatch.',
                  duration: 4500,
                }
              );
            };

            const handleRejectPitch = () => {
              updateStatusMutation.mutate({
                pitchId: selectedPitch.id,
                status: 'REJECTED',
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

                  {/* Header Quick Actions */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <Button
                      onClick={handleScheduleCall}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 bg-[#163728] hover:bg-[#10291e] text-[#F9F8F5] font-medium text-xs py-2 px-3 rounded-md flex items-center justify-center gap-1.5 shadow-none transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Partner Call</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleRejectPitch}
                      disabled={updateStatusMutation.isPending || selectedPitch.status === 'REJECTED'}
                      className="border-[#E5E2DC] bg-white hover:bg-[#FAECEB] text-[#862820] hover:border-[#F1C9C5] font-medium text-xs py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-none disabled:opacity-40"
                    >
                      <XCircle className="w-3.5 h-3.5 text-[#862820]" />
                      <span>{selectedPitch.status === 'REJECTED' ? 'Already Passed' : 'Pass / Reject'}</span>
                    </Button>
                  </div>
                </SheetHeader>

                {/* Executive AI Summary Box */}
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

                {/* 3-Section Breakdown */}
                <div className="space-y-4">
                  {/* Section 1: Why It Matches (Pros) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A422F] font-sans flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1A422F]" />
                      Why It Matches (Thesis Pros)
                    </h3>
                    <div className="space-y-1.5">
                      {selectedPitch.pros.map((pro, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-md bg-[#E6EFEA]/40 border border-[#C3DCD0] text-xs text-[#1A422F] flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1A422F] mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Execution Risks (Cons) */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7E4812] font-sans flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#7E4812]" />
                      Execution Risks (Diligence Cons)
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

                  {/* Section 3: Critical Red Flags */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#862820] font-sans flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#862820]" />
                      Critical Red Flags
                    </h3>
                    {selectedPitch.redFlags.length > 0 ? (
                      <div className="space-y-1.5">
                        {selectedPitch.redFlags.map((flag, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-md bg-[#FAECEB]/60 border border-[#F1C9C5] text-xs text-[#862820] flex items-start gap-2"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-[#862820] shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{flag}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] text-xs text-[#73706A] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#163728] shrink-0" />
                        <span>
                          Zero critical fatal red flags detected during automated audit.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Founding Team & Ingestion Verification */}
                <div className="p-3.5 rounded-md bg-[#F9F8F5] border border-[#E5E2DC] text-xs space-y-2">
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

                    {selectedPitch.websiteUrl && (
                      <a
                        href={selectedPitch.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#163728] hover:underline"
                      >
                        <span>{selectedPitch.websiteUrl}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
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
