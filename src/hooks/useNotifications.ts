'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDashboardPitches } from './useDashboardPitches';
import { useCurrentUser } from './useCurrentUser';
import { Pitch, PitchStatus } from '@/types/deal';

export interface DealNotification {
  id: string;
  referenceId?: string;
  startupName: string;
  tagline?: string;
  sector: string;
  reportedMrr: number;
  valuation: number;
  matchScore: number;
  status: PitchStatus;
  submittedAt: string;
  relativeTime: string;
  isRead: boolean;
  alertType: 'TOP_1_PERCENT' | 'REVIEW' | 'REJECTED';
  headline: string;
  subtext: string;
}

const STORAGE_KEY = 'dealflow_read_notifications';

function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Just now';
  const now = new Date().getTime();
  const date = new Date(dateString).getTime();
  const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));

  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function useNotifications() {
  const { slug } = useCurrentUser();
  const { data: pitches = [], isLoading } = useDashboardPitches({
    slug: slug || undefined,
  });

  const [readIds, setReadIds] = useState<string[]>([]);

  // Load persisted read notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to read notification state from localStorage:', e);
    }
  }, []);

  // Save to localStorage whenever readIds change
  const persistReadIds = useCallback((newIds: string[]) => {
    setReadIds(newIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    } catch (e) {
      console.warn('Failed to persist notification state to localStorage:', e);
    }
  }, []);

  // Sort pitches newest-first and derive notification items (top 8)
  const notifications: DealNotification[] = useMemo(() => {
    if (!pitches || pitches.length === 0) return [];

    const sorted = [...pitches].sort((a, b) => {
      const timeA = new Date(a.submittedAt || 0).getTime();
      const timeB = new Date(b.submittedAt || 0).getTime();
      return timeB - timeA;
    });

    return sorted.slice(0, 8).map((pitch) => {
      const isTopTier = pitch.status === 'TOP_1_PERCENT' || pitch.matchScore >= 85;
      const isRejected = pitch.status === 'REJECTED' || pitch.matchScore < 60;
      const alertType: 'TOP_1_PERCENT' | 'REVIEW' | 'REJECTED' = isTopTier
        ? 'TOP_1_PERCENT'
        : isRejected
        ? 'REJECTED'
        : 'REVIEW';

      let headline = '';
      let subtext = '';

      if (alertType === 'TOP_1_PERCENT') {
        headline = `${pitch.startupName} — Top 1% Match (${pitch.matchScore}/100)`;
        subtext = `Exemplary mandate alignment in ${pitch.sector}. Fast-track diligence suggested.`;
      } else if (alertType === 'REVIEW') {
        headline = `${pitch.startupName} — Queued for Review (${pitch.matchScore}/100)`;
        subtext = `Manual analyst review required against active thesis criteria.`;
      } else {
        headline = `${pitch.startupName} — Screened Out (${pitch.matchScore}/100)`;
        subtext = `Fatal guardrail or threshold mismatch detected by DealFlow gatekeeper.`;
      }

      return {
        id: pitch.id,
        referenceId: pitch.referenceId,
        startupName: pitch.startupName,
        tagline: pitch.tagline,
        sector: pitch.sector,
        reportedMrr: pitch.reportedMrr,
        valuation: pitch.valuation,
        matchScore: pitch.matchScore,
        status: pitch.status,
        submittedAt: pitch.submittedAt,
        relativeTime: formatRelativeTime(pitch.submittedAt),
        isRead: readIds.includes(pitch.id),
        alertType,
        headline,
        subtext,
      };
    });
  }, [pitches, readIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAsRead = useCallback(
    (pitchId: string) => {
      if (!readIds.includes(pitchId)) {
        persistReadIds([...readIds, pitchId]);
      }
    },
    [readIds, persistReadIds]
  );

  const markAllAsRead = useCallback(() => {
    const allIds = Array.from(new Set([...readIds, ...notifications.map((n) => n.id)]));
    persistReadIds(allIds);
  }, [readIds, notifications, persistReadIds]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  };
}

export default useNotifications;
