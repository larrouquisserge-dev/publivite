"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useStore, type Task as StoreTask } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  CalendarClock, PlusCircle, Play, Pause, XCircle, 
  Clock, CheckCircle2, AlertTriangle, RefreshCw,
  ChevronRight, Calendar, MapPin, User, Filter,
  FileText, Trash2, Edit, Loader2, Info, Coins
} from 'lucide-react';
import { formatDateTime, formatDate, generateId } from '@/lib/utils';

// Types pour les tâches (côté frontend)
type ScheduleType = 'immediate' | 'scheduled' | 'recurring';
type RecurrenceType = 'daily' | 'weekly' | 'monthly';
type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting_lbc_integration';

interface TaskLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

interface ExtendedTask extends StoreTask {
  scheduleType?: ScheduleType;
  recurrence?: {
    type: RecurrenceType;
    dayOfWeek?: number;
    dayOfMonth?: number;
    hour: number;
    minute: number;
  };
  logs?: TaskLog[];
}

// Villes françaises principales pour la sélection
const CITIES = [
  'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
  'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne',
  'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Clermont-Ferrand',
  'Le Mans', 'Aix-en-Provence', 'Brest', 'Tours', 'Amiens', 'Limoges', 'Annecy',
  'Perpignan', 'Boulogne-Billancourt', 'Metz', 'Besançon', 'Orléans', 'Rouen',
  'Saint-Denis', 'Argenteuil', 'Montreuil', 'Mulhouse', 'Caen', 'Nancy'
];

// Labels pour les statuts
const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', color: 'secondary', icon: Clock },
  running: { label: 'En cours', color: 'warning', icon: RefreshCw },
  completed: { label: 'Terminée', color: 'success', icon: CheckCircle2 },
  failed: { label: 'Échouée', color: 'destructive', icon: XCircle },
  cancelled: { label: 'Annulée', color: 'secondary', icon: XCircle },
  waiting_lbc_integration: { label: 'En attente LBC', color: 'warning', icon: Clock },
};

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, ads, accounts, credits, useCredits } = useStore();
  
  // État du modal de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);
  
  // État des filtres
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // État du formulaire de création
  const [formData, setFormData] = useState({
    adId: '',
    accountId: '',
    cities: [] as string[],
    type: 'publish' as 'publish' | 'republish',
    scheduleType: 'immediate' as ScheduleType,
    scheduledDate: '',
    scheduledTime: '',
    recurrenceType: 'daily' as RecurrenceType,
    recurrenceHour: '10',
    recurrenceMinute: '0',
    recurrenceDayOfWeek: '1',
    recurrenceDayOfMonth: '1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Calculer les crédits estimés
  const estimatedCredits = useMemo(() => {
    const creditPerCity = formData.type === 'publish' ? 1 : 0.5;
    return Math.ceil(formData.cities.length * creditPerCity);
  }, [formData.cities.length, formData.type]);

  // Filtrer les tâches
  const filteredTasks = useMemo(() => {
    return (tasks as ExtendedTask[]).filter(task => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (accountFilter !== 'all' && task.accountId !== accountFilter) return false;
      if (dateFilter) {
        const taskDate = new Date(task.scheduledAt).toISOString().split('T')[0];
        if (taskDate !== dateFilter) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, accountFilter, dateFilter]);

  // Filtrer les villes
  const filteredCities = useMemo(() => {
    if (!citySearch) return CITIES;
    return CITIES.filter(city => 
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [citySearch]);

  // Obtenir le nom de l'annonce
  const getAdTitle = useCallback((adId: string): string => {
    const ad = ads.find(a => a.id === adId);
    return ad?.title || 'Annonce inconnue';
  }, [ads]);

  // Obtenir l'email du compte
  const getAccountEmail = useCallback((accountId: string): string => {
    const account = accounts.find(a => a.id === accountId);
    return account?.email || 'Compte inconnu';
  }, [accounts]);

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    if (!formData.adId || !formData.accountId || formData.cities.length === 0) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    if (estimatedCredits > credits) {
      alert('Crédits insuffisants');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculer la date planifiée
      let scheduledAt = new Date().toISOString();
      
      if (formData.scheduleType === 'scheduled' && formData.scheduledDate && formData.scheduledTime) {
        scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
      }

      // Créer la tâche
      const newTask: StoreTask = {
        id: generateId(),
        adId: formData.adId,
        accountId: formData.accountId,
        type: formData.type,
        scheduledAt,
        cities: formData.cities,
        status: 'pending',
        creditsUsed: estimatedCredits,
        errorMessage: null,
        executedAt: null,
        createdAt: new Date().toISOString(),
      };

      addTask(newTask);
      useCredits(estimatedCredits);

      // Réinitialiser le formulaire
      setFormData({
        adId: '',
        accountId: '',
        cities: [],
        type: 'publish',
        scheduleType: 'immediate',
        scheduledDate: '',
        scheduledTime: '',
        recurrenceType: 'daily',
        recurrenceHour: '10',
        recurrenceMinute: '0',
        recurrenceDayOfWeek: '1',
        recurrenceDayOfMonth: '1',
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      alert('Erreur lors de la création de la tâche');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Annuler une tâche
  const handleCancelTask = (taskId: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette tâche ?')) {
      updateTask(taskId, { status: 'failed', errorMessage: 'Annulée par l\'utilisateur' });
    }
  };

  // Voir les logs d'une tâche
  const handleViewLogs = (task: ExtendedTask) => {
    setSelectedTask(task);
    setShowLogsModal(true);
  };

  // Supprimer une tâche
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      deleteTask(taskId);
    }
  };

  // Toggle ville sélectionnée
  const toggleCity = (city: string) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tâches planifiées</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} 
            {statusFilter !== 'all' && ` (${STATUS_LABELS[statusFilter]?.label.toLowerCase()})`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">En attente</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">En cours</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tasks.filter(t => t.status === 'running').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Terminées</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => t.status === 'failed').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="running">En cours</SelectItem>
                    <SelectItem value="completed">Terminées</SelectItem>
                    <SelectItem value="failed">Échouées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Compte</Label>
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les comptes</SelectItem>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des tâches */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarClock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune tâche planifiée
            </h3>
            <p className="text-gray-500 mb-4">
              Créez une tâche pour publier ou republier vos annonces automatiquement
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une tâche
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const statusInfo = STATUS_LABELS[task.status] || STATUS_LABELS.pending;
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Info principale */}
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-2 ${
                        task.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' :
                        task.status === 'running' ? 'bg-orange-50 dark:bg-orange-900/20' :
                        task.status === 'failed' ? 'bg-red-50 dark:bg-red-900/20' :
                        'bg-gray-50 dark:bg-gray-800'
                      }`}>
                        <StatusIcon className={`h-5 w-5 ${
                          task.status === 'completed' ? 'text-green-600' :
                          task.status === 'running' ? 'text-orange-600 animate-spin' :
                          task.status === 'failed' ? 'text-red-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white truncate">
                            {getAdTitle(task.adId)}
                          </span>
                          <Badge variant={statusInfo.color as any}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {getAccountEmail(task.accountId)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {task.cities.length} ville{task.cities.length > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDateTime(task.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5" />
                            {task.creditsUsed} crédit{task.creditsUsed > 1 ? 's' : ''}
                          </span>
                        </div>

                        {task.errorMessage && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {task.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-9 lg:ml-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLogs(task)}
                        className="gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Logs
                      </Button>
                      
                      {task.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelTask(task.id)}
                          className="gap-1 text-orange-600 hover:text-orange-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Annuler
                        </Button>
                      )}
                      
                      {(task.status === 'completed' || task.status === 'failed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Barre de progression pour les tâches en cours */}
                  {task.status === 'running' && (
                    <div className="mt-4 ml-9">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Publication en cours...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de création de tâche */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle tâche</DialogTitle>
            <DialogDescription>
              Planifiez une publication ou republication d&apos;annonce
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Sélection de l'annonce */}
            <div className="space-y-2">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Annonce à publier
              </Label>
              <Select value={formData.adId} onValueChange={(v) => setFormData(prev => ({ ...prev, adId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une annonce..." />
                </SelectTrigger>
                <SelectContent>
                  {ads.map(ad => (
                    <SelectItem key={ad.id} value={ad.id}>
                      {ad.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection du compte */}
            <div className="space-y-2">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Compte Leboncoin
              </Label>
              <Select value={formData.accountId} onValueChange={(v) => setFormData(prev => ({ ...prev, accountId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un compte..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.isActive).map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection des villes */}
            <div className="space-y-2">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                Villes de publication ({formData.cities.length} sélectionnée{formData.cities.length > 1 ? 's' : ''})
              </Label>
              
              {formData.cities.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.cities.map(city => (
                    <Badge key={city} variant="secondary" className="gap-1">
                      {city}
                      <button onClick={() => toggleCity(city)} className="hover:text-red-500">
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <Input
                placeholder="Rechercher une ville..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="mb-2"
              />
              
              <ScrollArea className="h-40 border rounded-lg p-2">
                <div className="space-y-1">
                  {filteredCities.map(city => (
                    <label key={city} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1">
                      <Checkbox
                        checked={formData.cities.includes(city)}
                        onCheckedChange={() => toggleCity(city)}
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Type de tâche */}
            <div className="space-y-2">
              <Label>Type de tâche</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'publish' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'publish' }))}
                  className="flex-1"
                >
                  Publication
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'republish' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'republish' }))}
                  className="flex-1"
                >
                  Republication
                </Button>
              </div>
            </div>

            {/* Type de planification */}
            <div className="space-y-2">
              <Label>Planification</Label>
              <div className="flex gap-2">
                {(['immediate', 'scheduled', 'recurring'] as const).map(type => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.scheduleType === type ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, scheduleType: type }))}
                    className="flex-1"
                  >
                    {type === 'immediate' ? 'Immédiate' : type === 'scheduled' ? 'Programmée' : 'Récurrente'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date/heure pour tâche programmée */}
            {formData.scheduleType === 'scheduled' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure</Label>
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Configuration de récurrence */}
            {formData.scheduleType === 'recurring' && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2">
                  <Label>Fréquence</Label>
                  <Select 
                    value={formData.recurrenceType} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, recurrenceType: v as RecurrenceType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Tous les jours</SelectItem>
                      <SelectItem value="weekly">Toutes les semaines</SelectItem>
                      <SelectItem value="monthly">Tous les mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrenceType === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Jour de la semaine</Label>
                    <Select 
                      value={formData.recurrenceDayOfWeek} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, recurrenceDayOfWeek: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Dimanche</SelectItem>
                        <SelectItem value="1">Lundi</SelectItem>
                        <SelectItem value="2">Mardi</SelectItem>
                        <SelectItem value="3">Mercredi</SelectItem>
                        <SelectItem value="4">Jeudi</SelectItem>
                        <SelectItem value="5">Vendredi</SelectItem>
                        <SelectItem value="6">Samedi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.recurrenceType === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Jour du mois</Label>
                    <Select 
                      value={formData.recurrenceDayOfMonth} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, recurrenceDayOfMonth: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heure</Label>
                    <Select 
                      value={formData.recurrenceHour} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, recurrenceHour: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>{String(i).padStart(2, '0')}h</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Minute</Label>
                    <Select 
                      value={formData.recurrenceMinute} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, recurrenceMinute: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">00</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="45">45</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Estimation des crédits */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Crédits nécessaires</span>
                </div>
                <span className="text-xl font-bold text-orange-600">{estimatedCredits}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Vous disposez de {credits} crédit{credits > 1 ? 's' : ''}
              </p>
              {estimatedCredits > credits && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Crédits insuffisants
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.adId || !formData.accountId || formData.cities.length === 0 || estimatedCredits > credits}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer la tâche
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal des logs */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Logs de la tâche</DialogTitle>
            <DialogDescription>
              {selectedTask && getAdTitle(selectedTask.adId)}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedTask?.logs && selectedTask.logs.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {selectedTask.logs.map((log, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        log.level === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                        log.level === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${
                          log.level === 'error' ? 'text-red-600' :
                          log.level === 'warning' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{log.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p>Aucun log disponible pour cette tâche</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogsModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
