'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, DealNotification } from '@/hooks/useNotifications';
import {
  Bell,
  Flame,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications();

  const handleNotificationClick = (notification: DealNotification) => {
    markAsRead(notification.id);
    setOpen(false);

    // Dispatch select-pitch event so dashboard opens the deal drawer immediately if already on page
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('select-pitch', { detail: { pitchId: notification.id } })
      );
    }

    router.push(`/dashboard?pitchId=${notification.id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-[#73706A] hover:text-[#161514] hover:bg-[#F3F1EC] cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#163728] px-1 text-[9px] font-bold text-[#F9F8F5] ring-2 ring-[#F9F8F5] animate-in fade-in zoom-in-75">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 sm:w-96 p-0 overflow-hidden">
        {/* Popover Header */}
        <div className="flex items-center justify-between border-b border-[#E5E2DC] bg-[#FAF8F5] px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-[#161514] tracking-tight uppercase font-sans">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] font-medium bg-[#163728]/10 text-[#163728] border-[#163728]/20 px-1.5 py-0 rounded-full"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#163728] hover:text-[#10291e] hover:underline cursor-pointer transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Scrollable Notification List */}
        <div className="max-h-84 overflow-y-auto divide-y divide-[#E5E2DC]/70">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#73706A]">
              Loading deal flow activity...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-[#E6EFEA] flex items-center justify-center mb-2.5 text-[#163728]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-[#161514]">
                Your triage queue is up to date
              </p>
              <p className="text-[11px] text-[#73706A] mt-0.5">
                No new inbound pitches awaiting screening.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isTopTier = n.alertType === 'TOP_1_PERCENT';
              const isReview = n.alertType === 'REVIEW';

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-[#F3F1EC]/80 ${
                    !n.isRead ? 'bg-[#FAF8F5]' : 'bg-white'
                  }`}
                >
                  {/* Left Icon Badge */}
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                      isTopTier
                        ? 'bg-[#E6EFEA] text-[#163728] border-[#C3DCD0]'
                        : isReview
                        ? 'bg-[#FAF4E8] text-[#7E4812] border-[#EBDCBE]'
                        : 'bg-[#FAECEB] text-[#862820] border-[#F1C9C5]'
                    }`}
                  >
                    {isTopTier ? (
                      <Flame className="w-3.5 h-3.5" />
                    ) : isReview ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-[#161514] truncate font-sans group-hover:text-[#163728] transition-colors">
                        {n.startupName}
                      </span>
                      <span className="text-[10px] text-[#A5A29C] shrink-0 font-sans">
                        {n.relativeTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#73706A] line-clamp-2 leading-relaxed">
                      {n.subtext}
                    </p>

                    {/* Metadata pill row */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 font-financial font-medium border ${
                          isTopTier
                            ? 'bg-[#E6EFEA] text-[#163728] border-[#C3DCD0]'
                            : isReview
                            ? 'bg-[#FAF4E8] text-[#7E4812] border-[#EBDCBE]'
                            : 'bg-[#FAECEB] text-[#862820] border-[#F1C9C5]'
                        }`}
                      >
                        {n.matchScore}/100 Score
                      </Badge>
                      <span className="text-[10px] text-[#73706A] truncate">
                        {n.sector}
                      </span>
                    </div>
                  </div>

                  {/* Unread indicator dot */}
                  {!n.isRead && (
                    <span
                      className="absolute right-3 top-4 h-1.5 w-1.5 rounded-full bg-[#163728]"
                      aria-label="Unread notification"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Popover Footer */}
        <div className="border-t border-[#E5E2DC] bg-[#FAF8F5] p-2 text-center">
          <button
            onClick={() => {
              setOpen(false);
              router.push('/dashboard');
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[#163728] hover:text-[#10291e] py-1.5 rounded transition-colors cursor-pointer"
          >
            <span>View all deals in triage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
