import React, { Suspense } from 'react';
import { getThesisBySlug } from '@/lib/mock-data';
import { PitchSubmissionPortal } from './portal-client';

export function generateStaticParams() {
  return [
    { slug: 'apex-family-office' },
    { slug: 'horizon-ventures' },
  ];
}

export default async function SubmitSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initialThesis = getThesisBySlug(slug);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F8F5] flex items-center justify-center text-xs text-[#73706A]">Loading portal...</div>}>
      <PitchSubmissionPortal slug={slug} initialThesis={initialThesis} />
    </Suspense>
  );
}
