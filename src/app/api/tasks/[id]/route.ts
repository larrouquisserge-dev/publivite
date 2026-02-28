/**
 * API Routes pour une tâche spécifique
 * 
 * GET /api/tasks/[id] - Récupère une tâche
 * PATCH /api/tasks/[id] - Met à jour une tâche
 * DELETE /api/tasks/[id] - Annule une tâche
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getTask, 
  updateTask, 
  cancelTask,
  type UpdateTaskParams,
} from '@/lib/queue';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]
 * Récupère les détails d'une tâche
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const task = await getTask(id);
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id]
 * Met à jour une tâche (uniquement si elle est en attente)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Vérifier que la tâche existe
    const existingTask = await getTask(id);
    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      );
    }

    // Extraire les champs modifiables
    const updates: UpdateTaskParams = {};
    
    if (body.cities && Array.isArray(body.cities) && body.cities.length > 0) {
      updates.cities = body.cities;
    }
    
    if (body.scheduledAt) {
      const scheduledDate = new Date(body.scheduledAt);
      if (!isNaN(scheduledDate.getTime()) && scheduledDate.getTime() > Date.now()) {
        updates.scheduledAt = body.scheduledAt;
      } else {
        return NextResponse.json(
          { success: false, error: 'Date de planification invalide ou dans le passé' },
          { status: 400 }
        );
      }
    }
    
    if (body.recurrence) {
      updates.recurrence = body.recurrence;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune modification fournie' },
        { status: 400 }
      );
    }

    // Mettre à jour la tâche
    const updatedTask = await updateTask(id, updates);
    
    if (!updatedTask) {
      return NextResponse.json(
        { success: false, error: 'Impossible de mettre à jour la tâche' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: 'Tâche mise à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Annule une tâche (uniquement si elle est en attente)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Annuler la tâche
    const cancelled = await cancelTask(id);
    
    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Impossible d\'annuler cette tâche (déjà en cours ou terminée)' },
        { status: 400 }
      );
    }

    // TODO: Rembourser les crédits si nécessaire
    // await refundCredits(userId, task.data.estimatedCredits);

    return NextResponse.json({
      success: true,
      message: 'Tâche annulée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la tâche:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
