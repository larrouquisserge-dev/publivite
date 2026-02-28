/**
 * Worker BullMQ pour le traitement des tâches de publication Leboncoin
 * 
 * Ce worker écoute la queue de publication et traite les jobs en utilisant
 * le module d'automatisation Playwright pour publier les annonces.
 */

import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, TASK_STATUS } from './config';
import { TaskData, TaskResult } from './types';
import { updateTaskStatus } from './queue-manager';

// Import du module Leboncoin
import {
  publishAdWithRetry,
  AccountCredentials,
  AdData,
  City,
  LeboncoinSession,
  PublishResult,
  DEFAULT_RATE_LIMIT,
} from '../leboncoin';

// Configuration de connexion Redis
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

/**
 * Instance du worker (lazy initialization)
 */
let worker: Worker | null = null;

/**
 * Cache des sessions Leboncoin par compte
 */
const sessionCache: Map<string, LeboncoinSession> = new Map();

/**
 * Statistiques de publication
 */
const publishStats = {
  totalPublications: 0,
  successful: 0,
  failed: 0,
  captchaEncountered: 0,
  creditsUsed: 0,
  lastPublicationTime: 0,
};

/**
 * Récupère les données d'une annonce depuis la DB
 * NOTE: Cette fonction devrait être implémentée pour récupérer les vraies données
 */
async function getAdData(adId: string): Promise<AdData | null> {
  // TODO: Implémenter la récupération depuis la base de données
  // Pour l'instant, retourne des données de test
  console.log(`[Worker] Récupération des données de l'annonce ${adId}`);
  
  // En production, cette fonction devrait:
  // 1. Récupérer l'annonce depuis Prisma/DB
  // 2. Convertir les données au format AdData
  // 3. Récupérer les URLs des images uploadées
  
  return null; // Retourne null pour forcer l'erreur si les données ne sont pas disponibles
}

/**
 * Récupère les identifiants d'un compte Leboncoin depuis la DB
 * NOTE: Cette fonction devrait être implémentée pour récupérer les vraies données
 */
async function getAccountCredentials(accountId: string): Promise<AccountCredentials | null> {
  // TODO: Implémenter la récupération depuis la base de données
  // Pour l'instant, retourne null
  console.log(`[Worker] Récupération des identifiants du compte ${accountId}`);
  
  // En production, cette fonction devrait:
  // 1. Récupérer le compte Leboncoin depuis Prisma/DB
  // 2. Déchiffrer le mot de passe avec decrypt()
  // 3. Retourner les identifiants
  
  return null;
}

/**
 * Récupère ou crée une session pour un compte
 */
function getSession(accountId: string): LeboncoinSession | undefined {
  const session = sessionCache.get(accountId);
  
  if (session) {
    // Vérifier si la session n'est pas expirée
    const expiresAt = new Date(session.expiresAt);
    if (new Date() < expiresAt) {
      return session;
    }
    // Session expirée, la supprimer du cache
    sessionCache.delete(accountId);
  }
  
  return undefined;
}

/**
 * Sauvegarde une session dans le cache
 */
function saveSession(accountId: string, session: LeboncoinSession): void {
  sessionCache.set(accountId, session);
}

/**
 * Applique un délai de rate limiting
 */
async function applyRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastPublication = now - publishStats.lastPublicationTime;
  
  if (timeSinceLastPublication < DEFAULT_RATE_LIMIT.minDelayBetweenAds) {
    const delay = DEFAULT_RATE_LIMIT.minDelayBetweenAds - timeSinceLastPublication;
    console.log(`[Worker] Rate limit: attente de ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Ajouter un délai aléatoire pour simuler un comportement humain
  const randomDelay = Math.floor(
    Math.random() * 
    (DEFAULT_RATE_LIMIT.randomDelayRange.max - DEFAULT_RATE_LIMIT.randomDelayRange.min) +
    DEFAULT_RATE_LIMIT.randomDelayRange.min
  );
  await new Promise(resolve => setTimeout(resolve, randomDelay));
}

/**
 * Traite une publication pour une ville spécifique
 */
async function processPublicationForCity(
  adData: AdData,
  credentials: AccountCredentials,
  city: City,
  session?: LeboncoinSession
): Promise<PublishResult> {
  console.log(`[Worker] Publication pour ${city.name}...`);
  
  // Appliquer le rate limiting
  await applyRateLimit();
  
  // Mettre à jour le temps de dernière publication
  publishStats.lastPublicationTime = Date.now();
  publishStats.totalPublications++;
  
  // Publier l'annonce avec retry automatique
  const result = await publishAdWithRetry(
    adData,
    credentials,
    city,
    session,
    {
      maxRetries: 2,
      useExistingSession: true,
      browserConfig: {
        headless: true,
        slowMo: 50,
        timeout: 60000,
      },
    }
  );
  
  // Mettre à jour les statistiques
  if (result.success) {
    publishStats.successful++;
  } else {
    publishStats.failed++;
    if (result.errorType === 'captcha') {
      publishStats.captchaEncountered++;
    }
  }
  
  return result;
}

/**
 * Traite une tâche de publication complète
 */
async function processPublication(job: Job<TaskData>): Promise<TaskResult> {
  const { id, adId, accountId, cities, type } = job.data;
  
  console.log(`[Worker] ====================================`);
  console.log(`[Worker] Traitement de la tâche ${id}`);
  console.log(`[Worker] Annonce: ${adId}, Compte: ${accountId}`);
  console.log(`[Worker] Villes: ${cities.join(', ')}`);
  console.log(`[Worker] Type: ${type}`);
  console.log(`[Worker] ====================================`);

  // Mettre à jour le statut en "en cours"
  updateTaskStatus(id, TASK_STATUS.RUNNING, 'Démarrage de la publication...');

  const publications: TaskResult['publications'] = [];
  let creditsUsedCount = 0;

  try {
    // 1. Récupérer les données de l'annonce
    console.log(`[Worker] Récupération des données de l'annonce...`);
    const adData = await getAdData(adId);
    
    if (!adData) {
      console.log(`[Worker] ❌ Annonce non trouvée: ${adId}`);
      updateTaskStatus(id, TASK_STATUS.FAILED, `Annonce non trouvée: ${adId}`);
      
      return {
        success: false,
        publications: [],
        errorMessage: `Annonce non trouvée: ${adId}`,
        executedAt: new Date().toISOString(),
      };
    }
    
    // 2. Récupérer les identifiants du compte Leboncoin
    console.log(`[Worker] Récupération des identifiants du compte...`);
    const credentials = await getAccountCredentials(accountId);
    
    if (!credentials) {
      console.log(`[Worker] ❌ Compte Leboncoin non trouvé: ${accountId}`);
      updateTaskStatus(id, TASK_STATUS.FAILED, `Compte Leboncoin non trouvé: ${accountId}`);
      
      return {
        success: false,
        publications: [],
        errorMessage: `Compte Leboncoin non trouvé: ${accountId}`,
        executedAt: new Date().toISOString(),
      };
    }
    
    // 3. Récupérer ou créer une session
    const session = getSession(accountId);
    
    // 4. Publier pour chaque ville
    for (const cityName of cities) {
      console.log(`[Worker] Publication pour ${cityName}...`);
      updateTaskStatus(id, TASK_STATUS.RUNNING, `Publication pour ${cityName} en cours...`);
      
      // Convertir le nom de ville en objet City
      // NOTE: En production, récupérer le code postal depuis la DB
      const city: City = {
        name: cityName,
        zipCode: '', // À récupérer depuis la DB
      };
      
      try {
        const result = await processPublicationForCity(adData, credentials, city, session);
        
        publications.push({
          city: cityName,
          status: result.success ? 'success' : 'failed',
          leboncoinUrl: result.adUrl,
          errorMessage: result.error,
        });
        
        if (result.success) {
          creditsUsedCount++;
          publishStats.creditsUsed++;
          console.log(`[Worker] ✅ ${cityName}: Publié avec succès`);
          if (result.adUrl) {
            console.log(`[Worker] URL: ${result.adUrl}`);
          }
        } else {
          console.log(`[Worker] ❌ ${cityName}: ${result.error}`);
          
          // Si c'est un CAPTCHA ou un blocage, arrêter les autres publications
          if (result.errorType === 'captcha' || result.errorType === 'blocked') {
            console.log(`[Worker] ⚠️ Arrêt des publications suite à ${result.errorType}`);
            break;
          }
        }
        
        // Mettre à jour la progression
        updateTaskStatus(
          id, 
          TASK_STATUS.RUNNING, 
          `${publications.length}/${cities.length} villes traitées`
        );
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`[Worker] ❌ Erreur pour ${cityName}: ${errorMsg}`);
        
        publications.push({
          city: cityName,
          status: 'failed',
          errorMessage: errorMsg,
        });
      }
    }
    
    // 5. Calculer le résultat final
    const successCount = publications.filter(p => p.status === 'success').length;
    const failedCount = publications.filter(p => p.status === 'failed').length;
    const overallSuccess = successCount > 0;
    
    // 6. Mettre à jour le statut final
    const finalStatus = overallSuccess 
      ? TASK_STATUS.COMPLETED
      : TASK_STATUS.FAILED;
    
    const statusMessage = `Terminé: ${successCount}/${cities.length} publications réussies, ${creditsUsedCount} crédit(s) utilisé(s)`;
    
    console.log(`[Worker] ${statusMessage}`);
    
    const result: TaskResult = {
      success: overallSuccess,
      publications,
      executedAt: new Date().toISOString(),
    };
    
    updateTaskStatus(id, finalStatus, statusMessage, result);
    
    console.log(`[Worker] Tâche ${id} terminée - ${statusMessage}`);
    
    return result;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`[Worker] ❌ Erreur critique: ${errorMsg}`);
    
    updateTaskStatus(id, TASK_STATUS.FAILED, `Erreur: ${errorMsg}`);
    
    return {
      success: false,
      publications,
      errorMessage: errorMsg,
      executedAt: new Date().toISOString(),
    };
  }
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

  console.log('[Worker] ====================================');
  console.log('[Worker] Démarrage du worker de publication Leboncoin');
  console.log(`[Worker] Redis: ${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`);
  console.log('[Worker] ====================================');
  
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
      concurrency: DEFAULT_RATE_LIMIT.maxConcurrent, // Maximum 2 jobs simultanés
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
export function getWorkerStats(): { 
  running: boolean; 
  name: string | undefined;
  publishStats: typeof publishStats;
} {
  return {
    running: isWorkerRunning(),
    name: worker?.name,
    publishStats: { ...publishStats },
  };
}

/**
 * Vide le cache des sessions
 */
export function clearSessionCache(): void {
  sessionCache.clear();
  console.log('[Worker] Cache des sessions vidé');
}
