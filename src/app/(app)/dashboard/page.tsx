"use client";

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  FileText, Users, CalendarClock, Coins, TrendingUp,
  PlusCircle, ArrowRight, CheckCircle2, XCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { ads, accounts, tasks, publications, credits } = useStore();

  const stats = [
    { label: 'Annonces', value: ads.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', href: '/ads' },
    { label: 'Comptes LBC', value: accounts.length, icon: Users, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', href: '/accounts' },
    { label: 'Tâches actives', value: tasks.filter(t => t.status === 'pending' || t.status === 'running').length, icon: CalendarClock, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', href: '/tasks' },
    { label: 'Crédits', value: credits, icon: Coins, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', href: '/credits' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Vue d&apos;ensemble de votre activité</p>
        </div>
        <Link href="/ads/new">
          <Button><PlusCircle className="mr-2 h-4 w-4" />Nouvelle annonce</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Actions rapides</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/ads/new">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <PlusCircle className="mr-3 h-5 w-5 text-orange-500" />
                <div className="text-left"><p className="font-medium">Créer une annonce</p><p className="text-xs text-gray-500">Nouvelle annonce manuelle</p></div>
              </Button>
            </Link>
            <Link href="/accounts">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Users className="mr-3 h-5 w-5 text-green-500" />
                <div className="text-left"><p className="font-medium">Ajouter un compte</p><p className="text-xs text-gray-500">Connecter un compte LBC</p></div>
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <CalendarClock className="mr-3 h-5 w-5 text-purple-500" />
                <div className="text-left"><p className="font-medium">Planifier une tâche</p><p className="text-xs text-gray-500">Publier ou republier</p></div>
              </Button>
            </Link>
            <Link href="/credits">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Coins className="mr-3 h-5 w-5 text-orange-500" />
                <div className="text-left"><p className="font-medium">Acheter des crédits</p><p className="text-xs text-gray-500">{credits} crédits restants</p></div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Dernières annonces</CardTitle>
            <Link href="/ads" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">Voir tout <ArrowRight className="h-3 w-3" /></Link>
          </CardHeader>
          <CardContent>
            {ads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-10 w-10 mb-3 text-gray-300" />
                <p>Aucune annonce créée</p>
                <Link href="/ads/new"><Button variant="link" className="mt-2">Créer votre première annonce</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {ads.slice(0, 5).map((ad) => (
                  <Link key={ad.id} href={`/ads/${ad.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ad.title || 'Sans titre'}</p>
                      <p className="text-xs text-gray-500">{ad.category}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {ad.price && <span className="text-sm font-semibold">{ad.price}€</span>}
                      <Badge variant={ad.status === 'published' ? 'success' : 'secondary'}>
                        {ad.status === 'published' ? 'Publiée' : 'Brouillon'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Dernières publications</CardTitle>
            <Link href="/history" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">Voir tout <ArrowRight className="h-3 w-3" /></Link>
          </CardHeader>
          <CardContent>
            {publications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="mx-auto h-10 w-10 mb-3 text-gray-300" />
                <p>Aucune publication effectuée</p>
                <p className="text-xs mt-1">Les publications apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-3">
                {publications.slice(0, 5).map((pub) => (
                  <div key={pub.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {pub.status === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                      <div>
                        <p className="text-sm font-medium">{pub.city}</p>
                        <p className="text-xs text-gray-500">{new Date(pub.publishedAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <Badge variant={pub.status === 'success' ? 'success' : 'destructive'}>
                      {pub.status === 'success' ? 'Réussi' : 'Échoué'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
