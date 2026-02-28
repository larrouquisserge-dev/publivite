/**
 * API Routes pour la gestion des tâches
 * 
 * GET /api/tasks - Liste les tâches avec filtres
 * POST /api/tasks - Crée une nouvelle tâche
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createTask, 
  listTasks, 
  calculateCredits,
  getQueueStats,
  TASK_STATUS,
  type CreateTaskParams,
  type TaskFilters,
} from '@/lib/queue';

/**
 * GET /api/tasks
 * Liste les tâches avec filtres optionnels
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extraire les filtres des paramètres
    const filters: TaskFilters = {};
    
    const status = searchParams.get('status');
    if (status) {
      filters.status = status.split(',') as typeof filters.status;
    }
    
    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) filters.dateFrom = dateFrom;
    
    const dateTo = searchParams.get('dateTo');
    if (dateTo) filters.dateTo = dateTo;
    
    const accountId = searchParams.get('accountId');
    if (accountId) filters.accountId = accountId;
    
    const adId = searchParams.get('adId');
    if (adId) filters.adId = adId;

    // Récupérer les tâches
    const tasks = await listTasks(Object.keys(filters).length > 0 ? filters : undefined);
    
    // Récupérer les stats de la queue
    const queueStats = await getQueueStats().catch(() => ({
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
        queueStats,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la récupération des tâches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Crée une nouvelle tâche de publication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const { adId, accountId, cities, type, scheduleType, scheduledAt, recurrence } = body;
    
    if (!adId || !accountId || !cities || !type || !scheduleType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données manquantes. Champs requis: adId, accountId, cities, type, scheduleType' 
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(cities) || cities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Au moins une ville doit être spécifiée' },
        { status: 400 }
      );
    }

    if (!['publish', 'republish'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type de tâche invalide (publish ou republish)' },
        { status: 400 }
      );
    }

    if (!['immediate', 'scheduled', 'recurring'].includes(scheduleType)) {
      return NextResponse.json(
        { success: false, error: 'Type de planification invalide' },
        { status: 400 }
      );
    }

    // Validation de la date planifiée
    if (scheduleType === 'scheduled') {
      if (!scheduledAt) {
        return NextResponse.json(
          { success: false, error: 'Date de planification requise pour une tâche planifiée' },
          { status: 400 }
        );
      }
      
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Date de planification invalide' },
          { status: 400 }
        );
      }
      
      if (scheduledDate.getTime() < Date.now()) {
        return NextResponse.json(
          { success: false, error: 'La date de planification doit être dans le futur' },
          { status: 400 }
        );
      }
    }

    // Validation de la récurrence
    if (scheduleType === 'recurring') {
      if (!recurrence || !recurrence.type || recurrence.hour === undefined || recurrence.minute === undefined) {
        return NextResponse.json(
          { success: false, error: 'Configuration de récurrence invalide' },
          { status: 400 }
        );
      }
    }

    // Calculer les crédits nécessaires
    const estimatedCredits = calculateCredits(cities.length, type);

    // TODO: Vérifier que l'utilisateur a assez de crédits
    // const userCredits = await getUserCredits(userId);
    // if (userCredits < estimatedCredits) {
    //   return NextResponse.json(
    //     { success: false, error: 'Crédits insuffisants' },
    //     { status: 402 }
    //   );
    // }

    // Créer la tâche
    const params: CreateTaskParams = {
      adId,
      accountId,
      cities,
      type,
      scheduleType,
      scheduledAt,
      recurrence,
    };

    const task = await createTask(params);

    // TODO: Décompter les crédits
    // await deductCredits(userId, estimatedCredits);

    return NextResponse.json({
      success: true,
      data: {
        task,
        estimatedCredits,
        message: 'Tâche créée avec succès',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la création de la tâche' },
      { status: 500 }
    );
  }
}
