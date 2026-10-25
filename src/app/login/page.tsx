'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mockInvestorUsers } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Signed in to Institutional Workspace', {
        description: `Welcome to Apex Family Office Deal Flow Desk.`,
      });
      router.push('/dashboard');
    }, 500);
  };

  const handleQuickDemoLogin = (user = mockInvestorUsers[0]) => {
    setIsLoading(true);
    setEmail(user.email);
    setPassword('••••••••••••');
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Authenticated as ${user.name}`, {
        description: `${user.role} • ${user.firmName}`,
      });
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#161514] flex flex-col md:flex-row antialiased">
      {/* Left Column: Private-Bank Brand & Capital Quote */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-[#F3F1EC] border-r border-[#E5E2DC] p-10 lg:p-14 flex-col justify-between">
        {/* Brand Top */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#163728] text-[#F9F8F5]">
            <Shield className="w-4 h-4 text-[#F9F8F5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-lg font-bold text-[#161514] tracking-tight">
              DealFlow AI
            </span>
            <span className="text-[10px] font-sans text-[#73706A] uppercase tracking-wider">
              Institutional Gatekeeper
            </span>
          </div>
        </div>

        {/* Center Editorial Quote & Benchmark */}
        <div className="space-y-8 max-w-md my-auto py-12">
          <Badge
            variant="outline"
            className="bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0] text-xs font-financial px-2.5 py-0.5 rounded-md"
          >
            Mandate Authority Desk
          </Badge>

          <blockquote className="space-y-4">
            <p className="font-editorial text-2xl lg:text-3xl text-[#161514] leading-snug font-medium italic">
              &ldquo;The essence of investment management is the management of risks, not the management of returns.&rdquo;
            </p>
            <footer className="text-xs text-[#73706A] font-sans">
              — Benjamin Graham, <cite className="not-italic font-medium text-[#161514]">The Intelligent Investor</cite>
            </footer>
          </blockquote>

          <div className="p-4 rounded-md bg-white border border-[#E5E2DC] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#73706A]">
              <span className="font-sans uppercase text-[10px] tracking-wider font-semibold">
                Screening Velocity
              </span>
              <span className="font-financial font-bold text-[#163728]">
                &lt; 180ms Latency
              </span>
            </div>
            <p className="text-xs text-[#161514] font-medium leading-relaxed">
              Every pitch deck ingested through your custom URL is parsed, verified against financial guardrails, and indexed before partner review.
            </p>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="flex items-center gap-2 text-xs text-[#73706A] pt-4 border-t border-[#E5E2DC]">
          <Lock className="w-3.5 h-3.5 text-[#163728]" />
          <span>Restricted institutional access • SOC-2 Type II Audited</span>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand logo */}
          <div className="flex md:hidden items-center gap-2.5 justify-center mb-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#163728] text-[#F9F8F5]">
              <Shield className="w-3.5 h-3.5 text-[#F9F8F5]" />
            </div>
            <span className="font-editorial text-lg font-bold text-[#161514]">
              DealFlow AI
            </span>
          </div>

          <div className="space-y-1.5 text-center md:text-left">
            <h1 className="font-editorial text-2xl md:text-3xl font-bold tracking-tight text-[#161514]">
              Sign in to Workspace
            </h1>
            <p className="text-xs text-[#73706A] font-sans">
              Access your institutional deal flow and gatekeeper thesis rules.
            </p>
          </div>

          {/* Form Card */}
          <Card className="bg-white border border-[#E5E2DC] p-6 rounded-md shadow-none space-y-5">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-[#161514]">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="victoria@apexfamily.office"
                  className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-[#161514]">
                    Password
                  </Label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Password reset instructions sent to registered work email');
                    }}
                    className="text-[11px] text-[#73706A] hover:text-[#161514] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none font-financial"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#163728] hover:bg-[#10291e] text-[#F9F8F5] font-medium py-2 rounded-md flex items-center justify-center gap-1.5 shadow-none transition-all cursor-pointer text-xs h-9 mt-1"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign in to Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="pt-2 border-t border-[#E5E2DC] space-y-2">
              <span className="text-[10px] text-[#73706A] uppercase font-sans font-semibold tracking-wider block text-center">
                Instant Sandbox Access
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickDemoLogin(mockInvestorUsers[0])}
                  className="w-full border-[#C3DCD0] bg-[#E6EFEA]/40 hover:bg-[#E6EFEA] text-[#1A422F] text-xs h-8 rounded-md font-medium cursor-pointer shadow-none flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3 h-3 text-[#163728]" />
                  <span>Apex Family Office</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickDemoLogin(mockInvestorUsers[1])}
                  className="w-full border-[#E5E2DC] bg-[#F3F1EC] hover:bg-[#EAE8E2] text-[#161514] text-xs h-8 rounded-md font-medium cursor-pointer shadow-none flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-[#73706A]" />
                  <span>Horizon Ventures</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Onboarding Link */}
          <div className="text-center text-xs text-[#73706A]">
            <span>New family office or venture firm? </span>
            <Link
              href="/register"
              className="text-[#163728] font-semibold hover:underline"
            >
              Request institutional onboarding
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
