"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, TrendingUp, CheckCircle2, XCircle, Coins, 
  Eye, CalendarDays, Users, Filter
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { formatDate } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

// Périodes disponibles
const PERIODS = [
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '3 derniers mois' },
  { value: '365', label: '1 an' },
  { value: 'custom', label: 'Personnalisé' },
];

// Couleurs pour les graphiques
const CHART_COLORS = {
  primary: '#f97316', // Orange
  success: '#22c55e', // Vert
  danger: '#ef4444', // Rouge
  secondary: '#6b7280', // Gris
  info: '#3b82f6', // Bleu
};

const PIE_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];

export default function StatsPage() {
  const { publications, accounts, ads, credits } = useStore();
  
  // États des filtres
  const [period, setPeriod] = useState('30');
  const [accountFilter, setAccountFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  // Calculer les dates de la période
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end = now;

    if (period === 'custom' && customDateFrom && customDateTo) {
      start = new Date(customDateFrom);
      end = new Date(customDateTo);
      end.setHours(23, 59, 59, 999);
    } else {
      const days = parseInt(period) || 30;
      start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    return { startDate: start, endDate: end };
  }, [period, customDateFrom, customDateTo]);

  // Filtrer les publications par période et compte
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const pubDate = new Date(pub.publishedAt);
      const inPeriod = pubDate >= startDate && pubDate <= endDate;
      const matchesAccount = accountFilter === 'all' || pub.accountId === accountFilter;
      return inPeriod && matchesAccount;
    });
  }, [publications, startDate, endDate, accountFilter]);

  // Statistiques globales
  const stats = useMemo(() => {
    const total = filteredPublications.length;
    const success = filteredPublications.filter(p => p.status === 'success').length;
    const failed = filteredPublications.filter(p => p.status === 'failed').length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    
    // Crédits consommés (estimation: 1 crédit par publication réussie)
    const creditsUsed = success;
    
    // Annonces actives
    const activeAds = ads.filter(a => a.status === 'published').length;

    return { total, success, failed, successRate, creditsUsed, activeAds };
  }, [filteredPublications, ads]);

  // Données pour le graphique d'évolution par jour
  const dailyData = useMemo(() => {
    const data: { date: string; success: number; failed: number; total: number }[] = [];
    const dateMap = new Map<string, { success: number; failed: number }>();

    // Créer toutes les dates de la période
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = formatDate(current);
      dateMap.set(dateKey, { success: 0, failed: 0 });
      current.setDate(current.getDate() + 1);
    }

    // Remplir avec les données réelles
    filteredPublications.forEach(pub => {
      const dateKey = formatDate(pub.publishedAt);
      const existing = dateMap.get(dateKey);
      if (existing) {
        if (pub.status === 'success') {
          existing.success++;
        } else {
          existing.failed++;
        }
      }
    });

    // Convertir en tableau
    dateMap.forEach((value, key) => {
      data.push({
        date: key,
        success: value.success,
        failed: value.failed,
        total: value.success + value.failed,
      });
    });

    return data;
  }, [filteredPublications, startDate, endDate]);

  // Données pour le graphique par catégorie
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredPublications.forEach(pub => {
      const ad = ads.find(a => a.id === pub.adId);
      if (ad) {
        const category = ad.category || 'Autre';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      }
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 catégories
  }, [filteredPublications, ads]);

  // Données pour le pie chart succès/échecs
  const statusPieData = useMemo(() => {
    return [
      { name: 'Réussies', value: stats.success, color: CHART_COLORS.success },
      { name: 'Échouées', value: stats.failed, color: CHART_COLORS.danger },
    ].filter(d => d.value > 0);
  }, [stats]);

  // Stats par compte
  const accountStats = useMemo(() => {
    const statsMap = new Map<string, { total: number; success: number; failed: number }>();

    filteredPublications.forEach(pub => {
      const existing = statsMap.get(pub.accountId) || { total: 0, success: 0, failed: 0 };
      existing.total++;
      if (pub.status === 'success') {
        existing.success++;
      } else {
        existing.failed++;
      }
      statsMap.set(pub.accountId, existing);
    });

    return Array.from(statsMap.entries()).map(([accountId, data]) => {
      const account = accounts.find(a => a.id === accountId);
      return {
        id: accountId,
        email: account?.email || 'Compte inconnu',
        ...data,
        successRate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredPublications, accounts]);

  // Custom tooltip pour les graphiques
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistiques</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Analyse détaillée de vos performances
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Sélecteur de période */}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates personnalisées */}
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="w-[140px]"
              />
              <span className="text-gray-400">→</span>
              <Input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="w-[140px]"
              />
            </div>
          )}

          {/* Sélecteur de compte */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les comptes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les comptes</SelectItem>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques globales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total publications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3 bg-orange-50 dark:bg-orange-900/20">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Taux de succès</p>
                <p className="text-2xl font-bold text-orange-600">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3 bg-purple-50 dark:bg-purple-900/20">
                <Coins className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Crédits consommés</p>
                <p className="text-2xl font-bold text-purple-600">{stats.creditsUsed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3 bg-green-50 dark:bg-green-900/20">
                <Eye className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Annonces actives</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeAds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Graphique d'évolution des publications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Évolution des publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 && dailyData.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.danger} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.danger} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const parts = value.split(' ');
                      return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : value;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="success"
                    name="Réussies"
                    stroke={CHART_COLORS.success}
                    fill="url(#colorSuccess)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    name="Échouées"
                    stroke={CHART_COLORS.danger}
                    fill="url(#colorFailed)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Pas de données pour cette période</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Taux de succès */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Répartition succès / échecs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Pas de données</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Publications par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Publications par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Publications" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Pas de données</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tableau des stats par compte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Statistiques par compte Leboncoin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Compte
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Total
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Réussies
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Échouées
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Taux de succès
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accountStats.map((account) => (
                    <tr 
                      key={account.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {account.email}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-semibold">{account.total}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-green-600 font-semibold">{account.success}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-red-600 font-semibold">{account.failed}</span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge 
                          variant={account.successRate >= 80 ? 'success' : account.successRate >= 50 ? 'warning' : 'destructive'}
                        >
                          {account.successRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Pas de données pour cette période</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder pour les vues des annonces (fonctionnalité future) */}
      <Card className="border-dashed border-2">
        <CardContent className="py-8 text-center">
          <Eye className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            Statistiques de vues
          </h3>
          <p className="text-sm text-gray-500">
            Les statistiques de vues des annonces seront disponibles après l&apos;intégration Leboncoin
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
