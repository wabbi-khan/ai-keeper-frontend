'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  SlidersHorizontal, 
  ExternalLink, 
  ShieldCheck, 
  Building2,
  ChevronRight,
  Shield,
  Copy,
  Check,
  LogOut,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockThesis } from '@/lib/mock-data';

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);

  const navItems = [
    {
      title: 'Deal Flow',
      href: '/dashboard',
      icon: TrendingUp,
      badge: 'Active',
      isExact: true,
      description: 'Incoming pitches & AI triage',
    },
    {
      title: 'Thesis Rules',
      href: '/dashboard/thesis',
      icon: SlidersHorizontal,
      description: 'Screening criteria & gates',
    },
  ];

  const handleCopyPitchLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const portalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/submit/${mockThesis.slug}`
      : `/submit/${mockThesis.slug}`;
    
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    toast.success('Public pitch portal link copied!', {
      description: portalUrl,
      duration: 4000,
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSignOut = () => {
    toast.info('Signed out of Apex Family Office desk');
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[#F3F1EC] text-[#161514] border-r border-[#E5E2DC] w-64 select-none',
        className
      )}
    >
      {/* Editorial Brand Header */}
      <div className="p-5 border-b border-[#E5E2DC]">
        <Link 
          href="/dashboard" 
          onClick={onNavigate}
          className="flex items-center gap-3 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#163728] text-[#F9F8F5] border border-[#163728] shadow-none">
            <Shield className="w-4 h-4 text-[#F9F8F5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-editorial text-lg font-bold tracking-tight text-[#161514]">
                DealFlow
              </span>
              <span className="text-[10px] font-sans font-semibold px-1 py-0.2 rounded bg-white text-[#163728] border border-[#E5E2DC]">
                AI
              </span>
            </div>
            <span className="text-[10px] font-sans text-[#73706A] uppercase tracking-wider font-medium">
              Institutional Gatekeeper
            </span>
          </div>
        </Link>
      </div>

      {/* Gatekeeper Engine Status Banner */}
      <div className="mx-3 my-3 p-2.5 rounded-md bg-white border border-[#E5E2DC] flex items-center justify-between shadow-none">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#163728]" />
          <span className="text-xs font-medium text-[#161514]">
            AI Gatekeeper
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-mono tracking-wider font-semibold bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0] px-1.5 py-0 rounded"
        >
          ONLINE
        </Badge>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 space-y-6 overflow-y-auto pt-2">
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold text-[#73706A] uppercase tracking-widest font-sans">
            Institutional Desk
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.isExact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-white text-[#161514] border border-[#E5E2DC] shadow-none font-semibold'
                      : 'text-[#73706A] hover:text-[#161514] hover:bg-[#EAE8E2] border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive
                          ? 'text-[#163728]'
                          : 'text-[#73706A] group-hover:text-[#161514]'
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-financial px-1.5 py-0.2 rounded bg-[#E6EFEA] text-[#1A422F] border border-[#C3DCD0]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Public Ingestion Link & Copy Action */}
        <div className="space-y-2">
          <div className="px-3 text-[10px] font-semibold text-[#73706A] uppercase tracking-widest font-sans">
            Founder Ingestion URL
          </div>
          
          <div className="p-2.5 rounded-md bg-white border border-[#E5E2DC] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans font-medium text-[#161514] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#163728]" />
                <span>Public Intake Portal</span>
              </span>
              <a
                href={`/submit/${mockThesis.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#73706A] hover:text-[#163728]"
                title="Open in new tab"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <div className="text-[10px] font-financial text-[#73706A] bg-[#F9F8F5] p-1.5 rounded border border-[#E5E2DC] truncate">
              /submit/{mockThesis.slug}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPitchLink}
              className="w-full h-7 text-[11px] border-[#E5E2DC] bg-[#F3F1EC] hover:bg-[#EAE8E2] text-[#161514] rounded-md shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-[#163728]" />
                  <span className="text-[#163728] font-medium">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#73706A]" />
                  <span>Copy Public Pitch Link</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Profile Widget with Sign Out Button */}
      <div className="p-3 border-t border-[#E5E2DC] bg-[#F3F1EC] space-y-2">
        <div className="p-2.5 rounded-md bg-white border border-[#E5E2DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#EAE8E2] border border-[#E5E2DC] font-semibold text-xs text-[#163728] font-financial shrink-0">
              AF
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#161514] truncate">
                Apex Family Office
              </span>
              <span className="text-[10px] text-[#73706A] truncate">
                Victoria Sterling
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-7 w-7 text-[#73706A] hover:text-[#862820] hover:bg-[#FAECEB] rounded-md cursor-pointer"
            title="Sign Out of Desk"
            aria-label="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
