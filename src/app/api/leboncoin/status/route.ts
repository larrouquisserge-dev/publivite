/**
 * API Route: Statut du système d'automatisation Leboncoin
 * 
 * GET /api/leboncoin/status
 * 
 * Retourne l'état du système d'automatisation, incluant:
 * - État de Playwright
 * - État du worker
 * - Statistiques de publication
 */

import { NextResponse } from 'next/server';
import { checkPlaywrightInstallation, DEFAULT_RATE_LIMIT } from '@/lib/leboncoin';
import { getWorkerStats, isWorkerRunning } from '@/lib/queue/worker';

/**
 * GET /api/leboncoin/status
 * 
 * Response:
 * {
 *   playwright: { installed: boolean, browserPath?: string },
 *   worker: { running: boolean, stats: {...} },
 *   rateLimits: { ... },
 *   timestamp: string
 * }
 */
export async function GET() {
  try {
    // Vérifier l'état de Playwright
    const playwrightStatus = await checkPlaywrightInstallation();
    
    // Vérifier l'état du worker
    let workerStats;
    try {
      workerStats = getWorkerStats();
    } catch {
      workerStats = {
        running: false,
        name: undefined,
        publishStats: {
          totalPublications: 0,
          successful: 0,
          failed: 0,
          captchaEncountered: 0,
          lastPublicationTime: 0,
        },
      };
    }

    return NextResponse.json({
      playwright: {
        installed: playwrightStatus.installed,
        browserPath: playwrightStatus.browserPath,
        error: playwrightStatus.error,
      },
      worker: {
        running: workerStats.running,
        name: workerStats.name,
        stats: workerStats.publishStats,
      },
      rateLimits: {
        maxConcurrent: DEFAULT_RATE_LIMIT.maxConcurrent,
        minDelayBetweenAds: DEFAULT_RATE_LIMIT.minDelayBetweenAds,
        maxAdsPerHour: DEFAULT_RATE_LIMIT.maxAdsPerHour,
        maxAdsPerDay: DEFAULT_RATE_LIMIT.maxAdsPerDay,
      },
      features: {
        autoRetry: true,
        sessionCaching: true,
        captchaDetection: true,
        screenshotOnError: true,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API] Erreur lors de la récupération du statut:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur interne du serveur',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
