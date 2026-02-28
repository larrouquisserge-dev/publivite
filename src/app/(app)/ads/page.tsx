"use client";

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getCategoryByValue } from '@/data/categories';
import Link from 'next/link';
import {
  PlusCircle, Search, FileText, MoreHorizontal,
  Edit, Copy, Trash2, Eye, Filter,
} from 'lucide-react';
import { formatPrice, formatDate, truncate } from '@/lib/utils';

export default function AdsPage() {
  const { ads, deleteAd, addAd } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAds = ads.filter(ad => {
    const matchesSearch = !search || ad.title.toLowerCase().includes(search.toLowerCase()) || ad.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = (ad: typeof ads[0]) => {
    const newAd = {
      ...ad,
      id: Math.random().toString(36).substring(2, 15),
      title: `${ad.title} (copie)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addAd(newAd);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes annonces</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{ads.length} annonce{ads.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/ads/new">
          <Button><PlusCircle className="mr-2 h-4 w-4" />Nouvelle annonce</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              {['all', 'draft', 'published', 'archived'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'Toutes' : status === 'draft' ? 'Brouillons' : status === 'published' ? 'Publiées' : 'Archivées'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredAds.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {ads.length === 0 ? 'Aucune annonce' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500 mb-4">
              {ads.length === 0 ? 'Créez votre première annonce pour commencer' : 'Essayez de modifier vos filtres'}
            </p>
            {ads.length === 0 && (
              <Link href="/ads/new"><Button>Créer une annonce</Button></Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAds.map((ad) => {
            const cat = getCategoryByValue(ad.category);
            return (
              <Card key={ad.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      {ad.images.length > 0 ? (
                        <img src={ad.images[0]} alt="" className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <FileText className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{ad.title || 'Sans titre'}</h3>
                        <Badge variant={ad.status === 'published' ? 'success' : ad.status === 'draft' ? 'secondary' : 'warning'}>
                          {ad.status === 'published' ? 'Publiée' : ad.status === 'draft' ? 'Brouillon' : 'Archivée'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{truncate(ad.description || 'Pas de description', 100)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {cat && <Badge variant="outline">{cat.label}</Badge>}
                        <span className="text-xs text-gray-400">{formatDate(ad.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ad.price && <span className="text-lg font-bold text-gray-900 dark:text-white">{ad.price}€</span>}
                      <div className="flex items-center gap-1">
                        <Link href={`/ads/${ad.id}`}>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(ad)}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteAd(ad.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
