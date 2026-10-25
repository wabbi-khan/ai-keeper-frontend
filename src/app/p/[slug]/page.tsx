import React, { Suspense } from 'react';
import { PitchSubmissionPortal } from '@/app/submit/[slug]/portal-client';

export default async function PublicPitchSubmissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9F8F5] flex items-center justify-center text-xs text-[#73706A]">
          Loading submission portal...
        </div>
      }
    >
      <PitchSubmissionPortal slug={slug} />
    </Suspense>
  );
}
