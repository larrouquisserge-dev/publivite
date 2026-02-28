/**
 * Gestionnaire de files d'attente BullMQ
 * 
 * Ce module gère la création et la gestion des queues pour les tâches de publication.
 * Il fournit des méthodes pour ajouter des jobs, récupérer leur état, et les annuler.
 */

import { Queue, Job, QueueEvents } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { 
  REDIS_CONFIG, 
  QUEUE_NAMES, 
  QUEUE_OPTIONS, 
  TASK_STATUS,
  type TaskStatus 
} from './config';
import { 
  Task, 
  TaskData, 
  TaskLog, 
  CreateTaskParams, 
  UpdateTaskParams,
  TaskFilters 
} from './types';

// Stockage en mémoire des tâches (en production, utiliser une base de données)
// Ce stockage temporaire permet de gérer les tâches sans dépendance externe
const tasksStore = new Map<string, Task>();

// Instance unique de la queue (lazy initialization)
let publicationQueue: Queue | null = null;
let queueEvents: QueueEvents | null = null;

/**
 * Obtient ou crée l'instance de la queue de publication
 */
export function getPublicationQueue(): Queue {
  if (!publicationQueue) {
    publicationQueue = new Queue(QUEUE_NAMES.PUBLICATION, {
      connection: REDIS_CONFIG,
      ...QUEUE_OPTIONS,
    });
  }
  return publicationQueue;
}

/**
 * Obtient l'instance des événements de queue
 */
export function getQueueEvents(): QueueEvents {
  if (!queueEvents) {
    queueEvents = new QueueEvents(QUEUE_NAMES.PUBLICATION, { connection: REDIS_CONFIG });
  }
  return queueEvents;
}

/**
 * Calcule le nombre de crédits nécessaires pour une tâche
 * @param cities Nombre de villes
 * @param type Type de tâche
 */
export function calculateCredits(cities: number, type: 'publish' | 'republish'): number {
  // 1 crédit par ville pour une publication, 0.5 pour une republication
  const creditPerCity = type === 'publish' ? 1 : 0.5;
  return Math.ceil(cities * creditPerCity);
}

/**
 * Ajoute un log à une tâche
 */
function addLog(taskId: string, level: TaskLog['level'], message: string, data?: Record<string, unknown>): void {
  const task = tasksStore.get(taskId);
  if (task) {
    task.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    });
    task.updatedAt = new Date().toISOString();
    tasksStore.set(taskId, task);
  }
}

/**
 * Crée une nouvelle tâche de publication
 */
export async function createTask(params: CreateTaskParams): Promise<Task> {
  const queue = getPublicationQueue();
  const taskId = uuidv4();
  
  // Calculer les crédits estimés
  const estimatedCredits = calculateCredits(params.cities.length, params.type);
  
  // Créer les données de la tâche
  const taskData: TaskData = {
    id: taskId,
    adId: params.adId,
    accountId: params.accountId,
    cities: params.cities,
    type: params.type,
    scheduleType: params.scheduleType,
    scheduledAt: params.scheduledAt,
    recurrence: params.recurrence,
    estimatedCredits,
  };

  // Calculer le délai si planifié
  let delay: number | undefined;
  if (params.scheduleType === 'scheduled' && params.scheduledAt) {
    const scheduledTime = new Date(params.scheduledAt).getTime();
    const now = Date.now();
    delay = Math.max(0, scheduledTime - now);
  }

  // Créer la tâche dans le store
  const task: Task = {
    id: taskId,
    data: taskData,
    status: TASK_STATUS.PENDING,
    logs: [],
    creditsUsed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: params.scheduledAt,
  };
  
  tasksStore.set(taskId, task);
  addLog(taskId, 'info', 'Tâche créée', { scheduleType: params.scheduleType });

  // Ajouter le job à la queue
  const jobOptions: Record<string, unknown> = {
    jobId: taskId,
  };

  if (delay && delay > 0) {
    jobOptions.delay = delay;
    addLog(taskId, 'info', `Tâche planifiée pour ${params.scheduledAt}`, { delay });
  }

  // Pour les tâches récurrentes, on utilise repeat
  if (params.scheduleType === 'recurring' && params.recurrence) {
    const pattern = buildCronPattern(params.recurrence);
    jobOptions.repeat = { pattern };
    addLog(taskId, 'info', `Tâche récurrente configurée: ${pattern}`);
  }

  const job = await queue.add('publication', taskData, jobOptions);
  
  // Mettre à jour avec l'ID du job Bull
  task.bullJobId = job.id;
  tasksStore.set(taskId, task);
  
  addLog(taskId, 'info', `Job BullMQ créé avec ID: ${job.id}`);

  return task;
}

/**
 * Construit un pattern cron à partir de la configuration de récurrence
 */
function buildCronPattern(recurrence: TaskData['recurrence']): string {
  if (!recurrence) return '0 0 * * *'; // Par défaut: tous les jours à minuit
  
  const { type, hour, minute, dayOfWeek, dayOfMonth } = recurrence;
  
  switch (type) {
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      return `${minute} ${hour} * * ${dayOfWeek ?? 0}`;
    case 'monthly':
      return `${minute} ${hour} ${dayOfMonth ?? 1} * *`;
    default:
      return `${minute} ${hour} * * *`;
  }
}

/**
 * Récupère une tâche par son ID
 */
export async function getTask(taskId: string): Promise<Task | null> {
  return tasksStore.get(taskId) || null;
}

/**
 * Met à jour une tâche
 */
export async function updateTask(taskId: string, params: UpdateTaskParams): Promise<Task | null> {
  const task = tasksStore.get(taskId);
  if (!task) return null;

  // Ne peut modifier que les tâches en attente
  if (task.status !== TASK_STATUS.PENDING) {
    addLog(taskId, 'warning', 'Impossible de modifier une tâche déjà en cours ou terminée');
    return task;
  }

  // Mettre à jour les données
  if (params.cities) {
    task.data.cities = params.cities;
    task.data.estimatedCredits = calculateCredits(params.cities.length, task.data.type);
  }
  if (params.scheduledAt) {
    task.data.scheduledAt = params.scheduledAt;
    task.scheduledAt = params.scheduledAt;
  }
  if (params.recurrence) {
    task.data.recurrence = params.recurrence;
  }

  task.updatedAt = new Date().toISOString();
  tasksStore.set(taskId, task);
  addLog(taskId, 'info', 'Tâche mise à jour', params as unknown as Record<string, unknown>);

  // TODO: Mettre à jour le job dans la queue si nécessaire

  return task;
}

/**
 * Annule une tâche
 */
export async function cancelTask(taskId: string): Promise<boolean> {
  const task = tasksStore.get(taskId);
  if (!task) return false;

  // Ne peut annuler que les tâches en attente
  if (task.status !== TASK_STATUS.PENDING) {
    addLog(taskId, 'warning', 'Impossible d\'annuler une tâche déjà en cours ou terminée');
    return false;
  }

  // Supprimer le job de la queue
  const queue = getPublicationQueue();
  if (task.bullJobId) {
    const job = await queue.getJob(task.bullJobId);
    if (job) {
      await job.remove();
      addLog(taskId, 'info', 'Job supprimé de la queue');
    }
  }

  // Mettre à jour le statut
  task.status = TASK_STATUS.CANCELLED;
  task.updatedAt = new Date().toISOString();
  tasksStore.set(taskId, task);
  addLog(taskId, 'info', 'Tâche annulée');

  return true;
}

/**
 * Liste les tâches avec filtres
 */
export async function listTasks(filters?: TaskFilters): Promise<Task[]> {
  let tasks = Array.from(tasksStore.values());

  if (filters) {
    // Filtre par statut
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      tasks = tasks.filter(t => statuses.includes(t.status as TaskStatus));
    }

    // Filtre par date
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      tasks = tasks.filter(t => new Date(t.createdAt).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      tasks = tasks.filter(t => new Date(t.createdAt).getTime() <= to);
    }

    // Filtre par compte
    if (filters.accountId) {
      tasks = tasks.filter(t => t.data.accountId === filters.accountId);
    }

    // Filtre par annonce
    if (filters.adId) {
      tasks = tasks.filter(t => t.data.adId === filters.adId);
    }
  }

  // Trier par date de création (plus récent en premier)
  return tasks.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Récupère les logs d'une tâche
 */
export async function getTaskLogs(taskId: string): Promise<TaskLog[]> {
  const task = tasksStore.get(taskId);
  return task?.logs || [];
}

/**
 * Met à jour le statut d'une tâche
 * Utilisé par le worker lors du traitement
 */
export function updateTaskStatus(
  taskId: string, 
  status: TaskStatus, 
  message?: string,
  result?: Task['result']
): void {
  const task = tasksStore.get(taskId);
  if (task) {
    task.status = status;
    task.updatedAt = new Date().toISOString();
    
    if (result) {
      task.result = result;
      task.creditsUsed = result.publications.filter(p => p.status === 'success').length;
    }
    
    tasksStore.set(taskId, task);
    
    if (message) {
      addLog(taskId, status === TASK_STATUS.FAILED ? 'error' : 'info', message);
    }
  }
}

/**
 * Récupère les statistiques des queues
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}> {
  const queue = getPublicationQueue();
  
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
}

/**
 * Ferme proprement les connexions
 */
export async function closeConnections(): Promise<void> {
  if (publicationQueue) {
    await publicationQueue.close();
    publicationQueue = null;
  }
  if (queueEvents) {
    await queueEvents.close();
    queueEvents = null;
  }
}
