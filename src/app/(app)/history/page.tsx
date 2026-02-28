"use client";

import React, { useState, useMemo } from 'react';
import { useStore, type Publication } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, CheckCircle2, XCircle, Download, Search, 
  Filter, ChevronLeft, ChevronRight, ExternalLink,
  Calendar, AlertCircle, RefreshCw
} from 'lucide-react';
import { formatDateTime, formatDate } from '@/lib/utils';

// Nombre d'éléments par page
const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const { publications, accounts, ads } = useStore();
  
  // États des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Obtenir le nom de l'annonce par ID
  const getAdTitle = (adId: string): string => {
    const ad = ads.find(a => a.id === adId);
    return ad?.title || 'Annonce inconnue';
  };

  // Obtenir le nom du compte par ID
  const getAccountEmail = (accountId: string): string => {
    const account = accounts.find(a => a.id === accountId);
    return account?.email || 'Compte inconnu';
  };

  // Filtrer les publications
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      // Filtre par recherche (titre de l'annonce ou ville)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const adTitle = getAdTitle(pub.adId).toLowerCase();
        const city = pub.city.toLowerCase();
        if (!adTitle.includes(query) && !city.includes(query)) {
          return false;
        }
      }

      // Filtre par statut
      if (statusFilter !== 'all' && pub.status !== statusFilter) {
        return false;
      }

      // Filtre par compte
      if (accountFilter !== 'all' && pub.accountId !== accountFilter) {
        return false;
      }

      // Filtre par date (début)
      if (dateFrom) {
        const pubDate = new Date(pub.publishedAt);
        const fromDate = new Date(dateFrom);
        if (pubDate < fromDate) {
          return false;
        }
      }

      // Filtre par date (fin)
      if (dateTo) {
        const pubDate = new Date(pub.publishedAt);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (pubDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [publications, searchQuery, statusFilter, accountFilter, dateFrom, dateTo, ads, accounts]);

  // Pagination
  const totalPages = Math.ceil(filteredPublications.length / ITEMS_PER_PAGE);
  const paginatedPublications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPublications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPublications, currentPage]);

  // Stats rapides
  const stats = useMemo(() => {
    const total = filteredPublications.length;
    const success = filteredPublications.filter(p => p.status === 'success').length;
    const failed = filteredPublications.filter(p => p.status === 'failed').length;
    return { total, success, failed };
  }, [filteredPublications]);

  // Réinitialiser la page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, accountFilter, dateFrom, dateTo]);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Date', 'Annonce', 'Ville', 'Compte', 'Statut', 'URL Leboncoin', 'Erreur'];
    
    const rows = filteredPublications.map(pub => [
      formatDateTime(pub.publishedAt),
      getAdTitle(pub.adId),
      pub.city,
      getAccountEmail(pub.accountId),
      pub.status === 'success' ? 'Réussi' : 'Échoué',
      pub.leboncoinUrl || '',
      pub.errorMessage || ''
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historique_publications_${formatDate(new Date().toISOString())}.csv`;
    link.click();
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setAccountFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historique des publications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {stats.total} publication{stats.total > 1 ? 's' : ''} trouvée{stats.total > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
            {(statusFilter !== 'all' || accountFilter !== 'all' || dateFrom || dateTo) && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
          <Button onClick={exportCSV} className="gap-2" disabled={filteredPublications.length === 0}>
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <History className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Réussies</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Échouées</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher par titre d'annonce ou ville..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Filtre par statut */}
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="success">Réussi</SelectItem>
                    <SelectItem value="failed">Échoué</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par compte */}
              <div className="space-y-2">
                <Label>Compte Leboncoin</Label>
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les comptes</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par date (début) */}
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Filtre par date (fin) */}
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des publications */}
      {filteredPublications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune publication trouvée
            </h3>
            <p className="text-gray-500">
              {publications.length === 0 
                ? "L'historique de vos publications apparaîtra ici"
                : "Aucune publication ne correspond à vos filtres"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tableau responsive */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Annonce
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Ville
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">
                      Compte
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Statut
                    </th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPublications.map((pub) => (
                    <tr 
                      key={pub.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 hidden sm:block" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(pub.publishedAt)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(pub.publishedAt).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                          {getAdTitle(pub.adId)}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {pub.city}
                        </p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                          {getAccountEmail(pub.accountId)}
                        </p>
                      </td>
                      <td className="p-4">
                        {pub.status === 'success' ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Réussi
                          </Badge>
                        ) : (
                          <div className="space-y-1">
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Échoué
                            </Badge>
                            {pub.errorMessage && (
                              <div className="group relative">
                                <AlertCircle className="h-4 w-4 text-red-400 cursor-help" />
                                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-red-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-50">
                                  {pub.errorMessage}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {pub.leboncoinUrl ? (
                          <a
                            href={pub.leboncoinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Voir l&apos;annonce
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredPublications.length)} sur{' '}
                {filteredPublications.length} résultats
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))
                  }
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
