import { Plus_Jakarta_Sans, Newsreader, JetBrains_Mono } from 'next/font/google';

// 1. Google Fonts configuration
export const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const fontSerif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

// 2. Centralized Editorial Semantic Status Styles (Non-neon, Muted, Carta/FT inspired)
export const statusBadgeStyles = {
  high: {
    badge: 'bg-[#E6EFEA] text-[#1A422F] border-[#C3DCD0]',
    border: 'border-[#C3DCD0]',
    bg: 'bg-[#E6EFEA]',
    text: 'text-[#1A422F]',
    progressIndicator: '[&_[data-slot=progress-indicator]]:bg-[#163728]',
    dot: 'bg-[#1A422F]',
    label: 'Top 1% Mandate',
  },
  medium: {
    badge: 'bg-[#FAF4E8] text-[#7E4812] border-[#EBDCBE]',
    border: 'border-[#EBDCBE]',
    bg: 'bg-[#FAF4E8]',
    text: 'text-[#7E4812]',
    progressIndicator: '[&_[data-slot=progress-indicator]]:bg-[#965A18]',
    dot: 'bg-[#7E4812]',
    label: 'Partner Review',
  },
  low: {
    badge: 'bg-[#FAECEB] text-[#862820] border-[#F1C9C5]',
    border: 'border-[#F1C9C5]',
    bg: 'bg-[#FAECEB]',
    text: 'text-[#862820]',
    progressIndicator: '[&_[data-slot=progress-indicator]]:bg-[#BD2D22]',
    dot: 'bg-[#862820]',
    label: 'Auto-Rejected',
  },
} as const;

export function getEditorialStatusTheme(scoreOrStatus: number | string) {
  if (typeof scoreOrStatus === 'number') {
    if (scoreOrStatus >= 85) return statusBadgeStyles.high;
    if (scoreOrStatus >= 60) return statusBadgeStyles.medium;
    return statusBadgeStyles.low;
  }

  if (scoreOrStatus === 'TOP_1_PERCENT') return statusBadgeStyles.high;
  if (scoreOrStatus === 'REVIEW') return statusBadgeStyles.medium;
  return statusBadgeStyles.low;
}
