"use client";

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, CreditCard, Check, Zap } from 'lucide-react';

const CREDIT_PACKS = [
  { credits: 10, price: 10, popular: false },
  { credits: 50, price: 40, popular: false },
  { credits: 100, price: 70, popular: true },
  { credits: 250, price: 150, popular: false },
  { credits: 500, price: 250, popular: false },
];

export default function CreditsPage() {
  const { credits, addCredits } = useStore();

  const handleBuy = (pack: typeof CREDIT_PACKS[0]) => {
    // Simulation d'achat
    addCredits(pack.credits);
    alert(`${pack.credits} crédits ajoutés ! (simulation)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Acheter des crédits</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">1 crédit = 1 publication ou republication</p>
      </div>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm opacity-80">Solde actuel</p>
              <p className="text-4xl font-bold mt-1">{credits}</p>
              <p className="text-sm opacity-80 mt-1">crédits disponibles</p>
            </div>
            <Coins className="h-16 w-16 text-white/30" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {CREDIT_PACKS.map((pack) => (
          <Card key={pack.credits} className={`relative ${pack.popular ? 'border-orange-500 shadow-lg ring-2 ring-orange-500/20' : ''}`}>
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-500 text-white"><Zap className="h-3 w-3 mr-1" />Populaire</Badge>
              </div>
            )}
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{pack.credits}</p>
              <p className="text-sm text-gray-500 mb-4">crédits</p>
              <p className="text-2xl font-bold text-orange-500 mb-1">{pack.price}€</p>
              <p className="text-xs text-gray-500 mb-4">{(pack.price / pack.credits).toFixed(2)}€ / crédit</p>
              <Button onClick={() => handleBuy(pack)} className="w-full" variant={pack.popular ? 'default' : 'outline'}>
                <CreditCard className="mr-2 h-4 w-4" />Acheter
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Avantages des crédits</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              'Publication automatique sur Leboncoin',
              'Republication en un clic',
              'Publication multi-villes',
              'Planification avancée',
              'Crédits sans expiration',
              'Support prioritaire',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
