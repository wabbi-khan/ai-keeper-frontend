import type { Metadata } from 'next';
import './globals.css';
import { fontSans, fontSerif, fontMono } from '@/config/theme';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'DealFlow AI — Institutional Pitch & Deal Flow Gatekeeper',
  description:
    'Bespoke deal triage and thesis matching platform for Family Offices and venture partnerships.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
