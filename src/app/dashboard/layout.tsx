"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Shield, ExternalLink, Copy, Check } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { toast } from "sonner";
import { mockThesis } from "@/lib/mock-data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("dealflow_token");
      if (!token) {
        document.cookie =
          "dealflow_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        router.replace("/login");
      } else {
        if (!document.cookie.includes("dealflow_token=")) {
          document.cookie = `dealflow_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        }
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  const handleCopyPitchLink = () => {
    const activeSlug =
      typeof window !== "undefined"
        ? localStorage.getItem("dealflow_thesis_slug") || mockThesis.slug
        : mockThesis.slug;
    const portalUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/submit/${activeSlug}`
        : `/submit/${activeSlug}`;

    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    toast.success("Public pitch portal link copied!", {
      description: portalUrl,
      duration: 4000,
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F9F8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-6 h-6 rounded-full border-2 border-[#163728] border-t-transparent animate-spin" />
          <span className="text-xs text-[#73706A] font-financial">
            Verifying investor credentials...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F9F8F5] text-[#161514] antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <AppSidebar />
      </div>

      {/* Main Container */}
      <div className="flex flex-col flex-1 md:pl-64 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E5E2DC] bg-[#F9F8F5] px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-[#73706A] hover:text-[#161514] hover:bg-[#F3F1EC]"
                    aria-label="Open navigation menu"
                  />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 w-64 bg-[#F3F1EC] border-r border-[#E5E2DC] text-[#161514]"
              >
                <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Header Title / Breadcrumb Context */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#161514]">
                <Shield className="w-4 h-4 text-[#163728] hidden sm:inline" />
                <span className="font-editorial text-base font-bold">
                  Gatekeeper Desk
                </span>
              </div>
              {/* <span className="hidden sm:inline text-[#A5A29C]">/</span> */}
              {/* <span className="hidden sm:inline text-xs font-financial text-[#73706A]">
                Mandate v2.4
              </span> */}
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2.5">
            {/* <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F3F1EC] border border-[#E5E2DC] text-xs text-[#73706A]">
              <span className="w-2 h-2 rounded-full bg-[#163728]" />
              <span className="font-sans">Real-time Triage Active</span>
            </div> */}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPitchLink}
              className="hidden sm:inline-flex items-center gap-1.5 h-8 text-xs border-[#E5E2DC] bg-white hover:bg-[#F3F1EC] text-[#161514] rounded-md shadow-none cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#163728]" />
                  <span className="text-[#163728] font-medium">
                    Link Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#73706A]" />
                  <span>Copy Public Pitch Link</span>
                </>
              )}
            </Button>

            {/* <a
              href={`/submit/${mockThesis.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#163728] text-[#F9F8F5] hover:bg-[#10291e] transition-colors h-8"
            >
              <span>+ Founder Intake Link</span>
              <ExternalLink className="w-3 h-3" />
            </a> */}

            <NotificationBell />
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 p-4 md:p-8 bg-[#F9F8F5] max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
