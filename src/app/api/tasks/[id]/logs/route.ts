/**
 * API Route pour les logs d'une tâche
 * 
 * GET /api/tasks/[id]/logs - Récupère les logs d'une tâche
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTask, getTaskLogs } from '@/lib/queue';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]/logs
 * Récupère les logs d'exécution d'une tâche
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Vérifier que la tâche existe
    const task = await getTask(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les logs
    const logs = await getTaskLogs(id);

    return NextResponse.json({
      success: true,
      data: {
        taskId: id,
        taskStatus: task.status,
        logs,
        totalLogs: logs.length,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
