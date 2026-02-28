/**
 * Worker BullMQ pour le traitement des tâches de publication
 * 
 * Ce worker écoute la queue de publication et traite les jobs.
 * Pour l'instant, il marque les tâches comme "en attente d'intégration Leboncoin"
 * car l'intégration réelle sera implémentée dans une prochaine sous-tâche.
 */

import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, TASK_STATUS } from './config';
import { TaskData, TaskResult } from './types';
import { updateTaskStatus } from './queue-manager';

// Configuration de connexion Redis (utiliser les mêmes options que dans config.ts)
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Important pour BullMQ
};

/**
 * Instance du worker (lazy initialization)
 */
let worker: Worker | null = null;

/**
 * Simule le traitement d'une publication
 * En attendant l'intégration Leboncoin, on marque la tâche comme en attente
 */
async function processPublication(job: Job<TaskData>): Promise<TaskResult> {
  const { id, adId, accountId, cities, type } = job.data;
  
  console.log(`[Worker] Traitement de la tâche ${id}`);
  console.log(`[Worker] Annonce: ${adId}, Compte: ${accountId}`);
  console.log(`[Worker] Villes: ${cities.join(', ')}`);
  console.log(`[Worker] Type: ${type}`);

  // Mettre à jour le statut en "en cours"
  updateTaskStatus(id, TASK_STATUS.RUNNING, 'Traitement de la tâche en cours...');

  // Simuler un traitement (1 seconde par ville)
  const publications: TaskResult['publications'] = [];
  
  for (const city of cities) {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[Worker] Publication pour ${city}...`);
    
    // Pour l'instant, on marque tout comme "en attente d'intégration"
    // Dans la vraie implémentation, on appellerait l'API Leboncoin ici
    publications.push({
      city,
      status: 'success', // Simulation de succès
      // leboncoinUrl sera rempli quand l'intégration sera faite
    });
    
    // Mettre à jour le log de progression
    updateTaskStatus(
      id, 
      TASK_STATUS.RUNNING, 
      `Publication pour ${city}: en attente d'intégration Leboncoin`
    );
  }

  // Marquer la tâche comme en attente d'intégration
  const result: TaskResult = {
    success: true,
    publications,
    executedAt: new Date().toISOString(),
  };

  // Mettre à jour le statut final
  updateTaskStatus(
    id,
    TASK_STATUS.WAITING_LBC_INTEGRATION,
    `Tâche prête pour l'intégration Leboncoin (${cities.length} villes)`,
    result
  );

  console.log(`[Worker] Tâche ${id} terminée - En attente d'intégration Leboncoin`);
  
  return result;
}

/**
 * Gestionnaire d'erreurs pour les jobs
 */
function handleFailedJob(job: Job<TaskData> | undefined, error: Error): void {
  if (job) {
    console.error(`[Worker] Échec de la tâche ${job.data.id}:`, error.message);
    updateTaskStatus(
      job.data.id,
      TASK_STATUS.FAILED,
      `Erreur: ${error.message}`
    );
  } else {
    console.error('[Worker] Échec d\'un job sans données:', error.message);
  }
}

/**
 * Démarre le worker
 */
export function startWorker(): Worker {
  if (worker) {
    console.log('[Worker] Worker déjà en cours d\'exécution');
    return worker;
  }

  console.log('[Worker] Démarrage du worker de publication...');
  
  worker = new Worker<TaskData, TaskResult>(
    QUEUE_NAMES.PUBLICATION,
    async (job) => {
      try {
        return await processPublication(job);
      } catch (error) {
        handleFailedJob(job, error as Error);
        throw error;
      }
    },
    {
      connection: REDIS_CONFIG,
      concurrency: 1, // Traiter un job à la fois pour éviter les problèmes de rate limiting
    }
  );

  // Écouteurs d'événements
  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} complété avec succès`);
  });

  worker.on('failed', (job, error) => {
    handleFailedJob(job, error);
  });

  worker.on('error', (error) => {
    console.error('[Worker] Erreur du worker:', error.message);
  });

  worker.on('ready', () => {
    console.log('[Worker] Worker prêt à traiter les jobs');
  });

  return worker;
}

/**
 * Arrête le worker proprement
 */
export async function stopWorker(): Promise<void> {
  if (worker) {
    console.log('[Worker] Arrêt du worker...');
    await worker.close();
    worker = null;
    console.log('[Worker] Worker arrêté');
  }
}

/**
 * Vérifie si le worker est en cours d'exécution
 */
export function isWorkerRunning(): boolean {
  return worker !== null && !worker.closing;
}

/**
 * Récupère les statistiques du worker
 */
export function getWorkerStats(): { running: boolean; name: string | undefined } {
  return {
    running: isWorkerRunning(),
    name: worker?.name,
  };
}
