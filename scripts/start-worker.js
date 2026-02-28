const { startWorker } = require('../src/lib/queue/worker');

console.log('🚀 Démarrage du worker Bull...');

startWorker()
  .then(() => {
    console.log('✅ Worker démarré avec succès');
  })
  .catch((error) => {
    console.error('❌ Erreur lors du démarrage du worker:', error);
    process.exit(1);
  });

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('📛 Signal SIGTERM reçu, arrêt du worker...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📛 Signal SIGINT reçu, arrêt du worker...');
  process.exit(0);
});
