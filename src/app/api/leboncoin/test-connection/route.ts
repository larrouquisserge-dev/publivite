/**
 * API Route: Test de connexion à un compte Leboncoin
 * 
 * POST /api/leboncoin/test-connection
 * 
 * Permet de vérifier si les identifiants d'un compte Leboncoin sont valides
 * en tentant une connexion automatisée via Playwright.
 */

import { NextRequest, NextResponse } from 'next/server';
import { testLeboncoinConnection, checkPlaywrightInstallation, maskEmail } from '@/lib/leboncoin';

export const maxDuration = 60; // Timeout de 60 secondes

/**
 * POST /api/leboncoin/test-connection
 * 
 * Body:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   error?: string,
 *   logs?: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que Playwright est installé
    const playwrightCheck = await checkPlaywrightInstallation();
    if (!playwrightCheck.installed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Playwright n\'est pas correctement installé',
          details: playwrightCheck.error,
        },
        { status: 500 }
      );
    }

    // Parser le body
    const body = await request.json();
    const { email, password } = body;

    // Validation des paramètres
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email et mot de passe sont requis',
        },
        { status: 400 }
      );
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format d\'email invalide',
        },
        { status: 400 }
      );
    }

    console.log(`[API] Test de connexion Leboncoin pour ${maskEmail(email)}`);

    // Tester la connexion
    const result = await testLeboncoinConnection({
      id: 'test',
      email,
      password,
    });

    // Logger le résultat (sans le mot de passe)
    console.log(`[API] Résultat du test pour ${maskEmail(email)}: ${result.success ? 'Succès' : 'Échec'}`);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Connexion réussie ! Les identifiants sont valides.',
        logs: result.logs,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Échec de la connexion',
          logs: result.logs,
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('[API] Erreur lors du test de connexion:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne du serveur',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leboncoin/test-connection
 * 
 * Vérifie simplement si le système est prêt pour tester des connexions
 */
export async function GET() {
  try {
    const playwrightCheck = await checkPlaywrightInstallation();

    return NextResponse.json({
      ready: playwrightCheck.installed,
      browserPath: playwrightCheck.browserPath,
      error: playwrightCheck.error,
    });

  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        error: error instanceof Error ? error.message : 'Erreur interne',
      },
      { status: 500 }
    );
  }
}
