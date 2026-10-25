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
  Link2,
  Copy,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate URL slug from firm name
  const slug = firmName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'your-firm-slug';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !firmName.trim() || !email.trim() || !password) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authService.register({
        name: fullName,
        firmName,
        email,
        password,
      });

      toast.success('Gatekeeper Desk Created Successfully', {
        description: `Workspace provisioned for ${firmName} with custom intake portal /submit/${data.thesisSlug}`,
        duration: 5000,
      });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Registration Failed', {
        description: err.message || 'Failed to create investor account. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#161514] flex flex-col md:flex-row antialiased">
      {/* Left Column: Institutional Value Prop */}
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

        {/* Center Benefits */}
        <div className="space-y-6 max-w-md my-auto py-12">
          <Badge
            variant="outline"
            className="bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0] text-xs font-financial px-2.5 py-0.5 rounded-md"
          >
            Multi-Tenant Desk Onboarding
          </Badge>

          <div className="space-y-3">
            <h2 className="font-editorial text-2xl lg:text-3xl text-[#161514] font-bold leading-tight">
              Deploy your branded automated screening portal in minutes.
            </h2>
            <p className="text-xs text-[#73706A] font-sans leading-relaxed">
              Every investment partnership receives a unique inbound URL, dedicated thesis rule-engine, and autonomous audit briefing pipeline.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              'Unique founder intake URL tied directly to your mandate',
              'Strict numerical guardrails (MRR floor, valuation cap, round ask)',
              'Natural language prompt directives for fatal disqualification rules',
              'Audit briefs generated within seconds of PDF deck submission',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#161514]">
                <CheckCircle2 className="w-4 h-4 text-[#163728] shrink-0 mt-0.5" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="flex items-center gap-2 text-xs text-[#73706A] pt-4 border-t border-[#E5E2DC]">
          <Lock className="w-3.5 h-3.5 text-[#163728]" />
          <span>Encrypted single-tenant data isolation • Private banking confidentiality</span>
        </div>
      </div>

      {/* Right Column: Onboarding Form */}
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
              Create Gatekeeper Desk
            </h1>
            <p className="text-xs text-[#73706A] font-sans">
              Set up your Family Office or Venture Capital screening workspace.
            </p>
          </div>

          {/* Form Card */}
          <Card className="bg-white border border-[#E5E2DC] p-6 rounded-md shadow-none space-y-4">
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium text-[#161514]">
                  Principal / Partner Full Name *
                </Label>
                <Input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Victoria Sterling"
                  className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="firmName" className="text-xs font-medium text-[#161514]">
                  Family Office / Firm Name *
                </Label>
                <Input
                  id="firmName"
                  required
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="e.g. Apex Family Office"
                  className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none"
                />
              </div>

              {/* Unique Public Pitch URL Preview */}
              <div className="space-y-1 p-3 rounded-md bg-[#F9F8F5] border border-[#E5E2DC]">
                <div className="flex items-center justify-between text-[11px] text-[#73706A]">
                  <span className="font-sans font-medium flex items-center gap-1.5 text-[#161514]">
                    <Link2 className="w-3 h-3 text-[#163728]" />
                    <span>Public Pitch Intake URL</span>
                  </span>
                  <span className="font-financial text-[10px] text-[#1A422F]">Live Preview</span>
                </div>
                <div className="font-financial text-xs text-[#163728] font-semibold break-all pt-0.5">
                  dealflow.ai/submit/<span className="underline">{slug}</span>
                </div>
                <span className="text-[10px] text-[#73706A] block pt-0.5">
                  Founders submit pitch decks through this dedicated address.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-[#161514]">
                  Institutional Work Email *
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
                <Label htmlFor="password" className="text-xs font-medium text-[#161514]">
                  Secure Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-white border-[#E5E2DC] text-xs text-[#161514] placeholder-[#A5A29C] focus-visible:border-[#163728] h-9 rounded-md shadow-none font-financial pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 top-0 h-full px-2.5 flex items-center text-[#73706A] hover:text-[#161514] transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#163728] hover:bg-[#10291e] text-[#F9F8F5] font-medium py-2 rounded-md flex items-center justify-center gap-1.5 shadow-none transition-all cursor-pointer text-xs h-9 mt-2"
              >
                <span>{isSubmitting ? 'Provisioning Workspace...' : 'Create Gatekeeper Desk'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>

          {/* Sign In Link */}
          <div className="text-center text-xs text-[#73706A]">
            <span>Already have an institutional mandate? </span>
            <Link
              href="/login"
              className="text-[#163728] font-semibold hover:underline"
            >
              Sign in to workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
