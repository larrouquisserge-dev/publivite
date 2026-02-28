/**
 * Configuration Redis et Bull pour le système de tâches planifiées
 * 
 * Ce module configure la connexion Redis et les options par défaut pour BullMQ.
 * Redis est utilisé comme backend pour la gestion des files d'attente de tâches.
 */

// Configuration de connexion Redis
// En production, ces valeurs devraient venir de variables d'environnement
export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null as null, // Important pour BullMQ
};

/**
 * Obtient la configuration Redis pour les queues
 */
export function getRedisConfig() {
  return REDIS_CONFIG;
}

/**
 * Options par défaut pour les jobs
 */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3, // Nombre de tentatives en cas d'échec
  backoff: {
    type: 'exponential' as const,
    delay: 1000, // Délai initial de 1 seconde
  },
  removeOnComplete: {
    count: 100, // Garder les 100 derniers jobs terminés
    age: 24 * 3600, // Ou supprimer après 24h
  },
  removeOnFail: {
    count: 50, // Garder les 50 derniers jobs échoués
  },
};

/**
 * Options pour les queues
 */
export const QUEUE_OPTIONS = {
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
};

/**
 * Nom des queues
 */
export const QUEUE_NAMES = {
  PUBLICATION: 'publication-queue', // Queue pour les publications
  REPUBLICATION: 'republication-queue', // Queue pour les republications
  SCHEDULED: 'scheduled-queue', // Queue pour les tâches planifiées
};

/**
 * États possibles d'une tâche
 */
export const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  WAITING_LBC_INTEGRATION: 'waiting_lbc_integration', // En attente de l'intégration Leboncoin
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
