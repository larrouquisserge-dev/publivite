/**
 * Types et interfaces pour le système de tâches planifiées
 */

import { TaskStatus } from './config';

/**
 * Type de planification d'une tâche
 */
export type ScheduleType = 'immediate' | 'scheduled' | 'recurring';

/**
 * Fréquence pour les tâches récurrentes
 */
export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

/**
 * Données d'une tâche de publication
 */
export interface TaskData {
  /** ID unique de la tâche */
  id: string;
  /** ID de l'annonce à publier */
  adId: string;
  /** ID du compte Leboncoin à utiliser */
  accountId: string;
  /** Villes où publier l'annonce */
  cities: string[];
  /** Type de tâche */
  type: 'publish' | 'republish';
  /** Type de planification */
  scheduleType: ScheduleType;
  /** Date/heure planifiée (pour 'scheduled') */
  scheduledAt?: string;
  /** Configuration de récurrence (pour 'recurring') */
  recurrence?: {
    type: RecurrenceType;
    /** Jour de la semaine (0-6, 0 = dimanche) pour weekly */
    dayOfWeek?: number;
    /** Jour du mois (1-31) pour monthly */
    dayOfMonth?: number;
    /** Heure d'exécution (0-23) */
    hour: number;
    /** Minute d'exécution (0-59) */
    minute: number;
  };
  /** Nombre de crédits estimés */
  estimatedCredits: number;
  /** Métadonnées supplémentaires */
  metadata?: Record<string, unknown>;
}

/**
 * Résultat d'exécution d'une tâche
 */
export interface TaskResult {
  /** Succès de la tâche */
  success: boolean;
  /** Publications créées */
  publications: {
    city: string;
    status: 'success' | 'failed';
    leboncoinUrl?: string;
    errorMessage?: string;
  }[];
  /** Message d'erreur global */
  errorMessage?: string;
  /** Horodatage d'exécution */
  executedAt: string;
}

/**
 * Log d'exécution de tâche
 */
export interface TaskLog {
  /** Timestamp du log */
  timestamp: string;
  /** Niveau de log */
  level: 'info' | 'warning' | 'error';
  /** Message */
  message: string;
  /** Données supplémentaires */
  data?: Record<string, unknown>;
}

/**
 * Tâche complète avec son état
 */
export interface Task {
  /** ID unique */
  id: string;
  /** Données de la tâche */
  data: TaskData;
  /** Statut actuel */
  status: TaskStatus;
  /** Logs d'exécution */
  logs: TaskLog[];
  /** Résultat d'exécution */
  result?: TaskResult;
  /** Crédits utilisés */
  creditsUsed: number;
  /** Date de création */
  createdAt: string;
  /** Date de dernière mise à jour */
  updatedAt: string;
  /** Date d'exécution prévue */
  scheduledAt?: string;
  /** ID du job BullMQ */
  bullJobId?: string;
}

/**
 * Paramètres pour créer une nouvelle tâche
 */
export interface CreateTaskParams {
  /** ID de l'annonce */
  adId: string;
  /** ID du compte Leboncoin */
  accountId: string;
  /** Villes de publication */
  cities: string[];
  /** Type de tâche */
  type: 'publish' | 'republish';
  /** Type de planification */
  scheduleType: ScheduleType;
  /** Date/heure planifiée (ISO string) */
  scheduledAt?: string;
  /** Configuration de récurrence */
  recurrence?: TaskData['recurrence'];
}

/**
 * Paramètres pour mettre à jour une tâche
 */
export interface UpdateTaskParams {
  /** Nouvelles villes */
  cities?: string[];
  /** Nouvelle date planifiée */
  scheduledAt?: string;
  /** Nouvelle configuration de récurrence */
  recurrence?: TaskData['recurrence'];
}

/**
 * Filtres pour lister les tâches
 */
export interface TaskFilters {
  /** Filtre par statut */
  status?: TaskStatus | TaskStatus[];
  /** Filtre par date (début) */
  dateFrom?: string;
  /** Filtre par date (fin) */
  dateTo?: string;
  /** Filtre par compte */
  accountId?: string;
  /** Filtre par annonce */
  adId?: string;
}
