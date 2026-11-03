import React from 'react';
import { notFound } from 'next/navigation';
import { mockMatches } from '@/lib/mock-data';
import { MatchDetailClient } from '@/components/match/MatchDetailClient';

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return mockMatches.map(m => ({ id: m.id }));
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const match = mockMatches.find(m => m.id === id);

  if (!match) {
    notFound();
  }

  return <MatchDetailClient match={match} allMatches={mockMatches} />;
}

