/**
 * Script de démarrage du worker de publication Leboncoin
 * 
 * Usage: npx tsx scripts/start-worker.ts
 * 
 * Ce script démarre le worker BullMQ qui traite les tâches
 * de publication d'annonces sur Leboncoin.
 */

import { startWorker, stopWorker, getWorkerStats, clearSessionCache } from '../src/lib/queue/worker';

// Gérer l'arrêt propre du worker
process.on('SIGINT', async () => {
  console.log('\n[Script] SIGINT reçu, arrêt du worker...');
  await stopWorker();
  clearSessionCache();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Script] SIGTERM reçu, arrêt du worker...');
  await stopWorker();
  clearSessionCache();
  process.exit(0);
});

// Afficher les statistiques périodiquement
setInterval(() => {
  const stats = getWorkerStats();
  if (stats.running) {
    console.log('[Script] Statistiques du worker:', {
      publications: stats.publishStats.totalPublications,
      succès: stats.publishStats.successful,
      échecs: stats.publishStats.failed,
      captchas: stats.publishStats.captchaEncountered,
    });
  }
}, 60000); // Toutes les minutes

// Démarrer le worker
console.log('====================================');
console.log('PUBLIVITE - Worker de publication');
console.log('====================================');
console.log('');
console.log('Variables d\'environnement:');
console.log(`  REDIS_URL: ${process.env.REDIS_URL ? '***défini***' : 'non défini'}`);
console.log(`  REDIS_HOST: ${process.env.REDIS_HOST || 'localhost'}`);
console.log(`  REDIS_PORT: ${process.env.REDIS_PORT || '6379'}`);
console.log(`  PLAYWRIGHT_BROWSERS_PATH: ${process.env.PLAYWRIGHT_BROWSERS_PATH || '/home/ubuntu/.playwright-browsers'}`);
console.log('');

try {
  startWorker();
  console.log('Worker démarré avec succès');
  console.log('Appuyez sur Ctrl+C pour arrêter');
} catch (error) {
  console.error('Erreur lors du démarrage du worker:', error);
  process.exit(1);
}
