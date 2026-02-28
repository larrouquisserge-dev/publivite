"use client";

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { AdForm } from '@/components/ads/AdForm';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditAdPage() {
  const params = useParams();
  const router = useRouter();
  const { ads } = useStore();
  const ad = ads.find(a => a.id === params.id);

  if (!ad) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Annonce introuvable</h2>
        <Button variant="outline" onClick={() => router.push('/ads')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Retour aux annonces
        </Button>
      </div>
    );
  }

  return <AdForm initialAd={ad} mode="edit" />;
}
