import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CollectionView } from '@/components/shop/CollectionView';

export const metadata: Metadata = { title: 'Sarees — Rupaari' };

export default function SareesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <CollectionView />
    </Suspense>
  );
}
