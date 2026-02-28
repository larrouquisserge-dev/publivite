/**
 * Module de gestion des files d'attente
 * Exporte toutes les fonctions et types nécessaires
 */

// Configuration
export { 
  QUEUE_NAMES, 
  TASK_STATUS,
  type TaskStatus,
} from './config';

// Types
export type {
  ScheduleType,
  RecurrenceType,
  TaskData,
  TaskResult,
  TaskLog,
  Task,
  CreateTaskParams,
  UpdateTaskParams,
  TaskFilters,
} from './types';

// Gestionnaire de queue
export {
  getPublicationQueue,
  getQueueEvents,
  calculateCredits,
  createTask,
  getTask,
  updateTask,
  cancelTask,
  listTasks,
  getTaskLogs,
  updateTaskStatus,
  getQueueStats,
  closeConnections,
} from './queue-manager';

// Worker
export {
  startWorker,
  stopWorker,
  isWorkerRunning,
  getWorkerStats,
} from './worker';
