/**
 * Configuration Redis et Bull pour le système de tâches planifiées
 * 
 * Ce module configure la connexion Redis et les options par défaut pour BullMQ.
 * Redis est utilisé comme backend pour la gestion des files d'attente de tâches.
 */

/**
 * Parse une URL Redis pour extraire host, port et password
 * Format: redis://[:password@]host:port ou redis://user:password@host:port
 */
function parseRedisUrl(url: string): { host: string; port: number; password?: string } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
    };
  } catch (error) {
    console.error('Erreur lors du parsing de REDIS_URL:', error);
    // Fallback sur les valeurs par défaut
    return {
      host: 'localhost',
      port: 6379,
      password: undefined,
    };
  }
}

/**
 * Génère la configuration Redis
 * Priorité: REDIS_URL > REDIS_HOST/REDIS_PORT/REDIS_PASSWORD
 */
function buildRedisConfig() {
  // Si REDIS_URL est défini, on l'utilise en priorité (format Railway)
  if (process.env.REDIS_URL) {
    console.log('Configuration Redis via REDIS_URL');
    const { host, port, password } = parseRedisUrl(process.env.REDIS_URL);
    return {
      host,
      port,
      password,
      maxRetriesPerRequest: null as null,
    };
  }

  // Sinon, on utilise les variables séparées
  console.log('Configuration Redis via REDIS_HOST/PORT/PASSWORD');
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null as null,
  };
}

// Configuration de connexion Redis
export const REDIS_CONFIG = buildRedisConfig();

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
