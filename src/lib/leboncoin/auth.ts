/**
 * Authentification Leboncoin via Playwright
 * 
 * Ce module gère la connexion aux comptes Leboncoin,
 * la vérification des sessions et la gestion des cookies.
 */

import { LeboncoinBrowser } from './browser';
import { AccountCredentials, AuthResult, LeboncoinSession, SessionCookie } from './types';
import { maskEmail, maskPassword } from './crypto';

// URL de Leboncoin
const LEBONCOIN_URL = 'https://www.leboncoin.fr';
const LOGIN_URL = 'https://www.leboncoin.fr/account/login';

// Sélecteurs CSS pour les éléments de connexion
// NOTE: Ces sélecteurs peuvent changer si Leboncoin modifie son interface
const SELECTORS = {
  // Page d'accueil
  acceptCookies: '[data-testid="didomi-accept-button"], #didomi-notice-agree-button, button[id*="didomi"]',
  loginLink: '[data-test-id="login"], a[href*="/account/login"], button[data-test-id="header-login"]',
  
  // Formulaire de connexion
  emailInput: 'input[name="email"], input[type="email"], #email',
  passwordInput: 'input[name="password"], input[type="password"], #password',
  submitButton: 'button[type="submit"], button[data-testid="login-submit"]',
  
  // Détection d'erreurs et états
  loginError: '[data-testid="error"], .error-message, [class*="error"], [class*="Error"]',
  captchaFrame: 'iframe[src*="recaptcha"], iframe[src*="hcaptcha"], [class*="captcha"]',
  
  // Vérification de connexion réussie
  userMenu: '[data-test-id="user-menu"], [data-testid="user-menu"], [class*="userMenu"]',
  accountIcon: '[data-test-id="header-account"], a[href*="/account/index"]',
  logoutButton: 'button[data-testid="logout"], a[href*="/logout"]',
  
  // Page de profil
  profilePage: 'a[href*="/compte"], a[href*="/account"]',
};

// Délai d'expiration des sessions (24 heures)
const SESSION_EXPIRATION_HOURS = 24;

/**
 * Crée un log formaté
 */
function createLog(message: string): string {
  return `[${new Date().toISOString()}] ${message}`;
}

/**
 * Se connecte à un compte Leboncoin
 * 
 * @param browser - Instance du navigateur
 * @param credentials - Identifiants du compte
 * @returns Résultat de l'authentification
 */
export async function loginToLeboncoin(
  browser: LeboncoinBrowser,
  credentials: AccountCredentials
): Promise<AuthResult> {
  const logs: string[] = [];
  const page = browser.getPage();
  
  logs.push(createLog(`Tentative de connexion pour ${maskEmail(credentials.email)}`));
  
  try {
    // 1. Naviguer vers la page de connexion
    logs.push(createLog('Navigation vers Leboncoin...'));
    await page.goto(LEBONCOIN_URL, { waitUntil: 'domcontentloaded' });
    
    // Attendre un peu pour le chargement complet
    await browser.randomDelay(1000, 2000);
    
    // 2. Accepter les cookies si le bandeau apparaît
    try {
      const cookieButton = await page.$(SELECTORS.acceptCookies);
      if (cookieButton) {
        logs.push(createLog('Acceptation des cookies...'));
        await cookieButton.click();
        await browser.randomDelay(500, 1000);
      }
    } catch {
      // Le bandeau de cookies n'est pas toujours présent
    }
    
    // 3. Aller à la page de connexion
    logs.push(createLog('Navigation vers la page de connexion...'));
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await browser.randomDelay(1500, 2500);
    
    // Capture d'écran de la page de connexion
    await browser.takeScreenshot('login_page');
    
    // 4. Vérifier si un CAPTCHA est présent
    const captcha = await page.$(SELECTORS.captchaFrame);
    if (captcha) {
      logs.push(createLog('⚠️ CAPTCHA détecté sur la page de connexion'));
      await browser.takeScreenshot('captcha_detected');
      
      return {
        success: false,
        error: 'CAPTCHA détecté. Veuillez réessayer plus tard ou utiliser un autre compte.',
        errorType: 'captcha',
        logs,
      };
    }
    
    // 5. Remplir le formulaire de connexion
    logs.push(createLog('Remplissage du formulaire de connexion...'));
    
    // Attendre que le champ email soit visible
    await page.waitForSelector(SELECTORS.emailInput, { timeout: 10000 });
    
    // Remplir l'email de manière humaine
    logs.push(createLog(`Saisie de l'email: ${maskEmail(credentials.email)}`));
    await browser.humanType(SELECTORS.emailInput, credentials.email);
    await browser.randomDelay(300, 700);
    
    // Remplir le mot de passe
    logs.push(createLog(`Saisie du mot de passe: ${maskPassword()}`));
    await browser.humanType(SELECTORS.passwordInput, credentials.password);
    await browser.randomDelay(300, 700);
    
    // Capture avant soumission
    await browser.takeScreenshot('before_login_submit');
    
    // 6. Soumettre le formulaire
    logs.push(createLog('Soumission du formulaire...'));
    await browser.humanClick(SELECTORS.submitButton);
    
    // Attendre la réponse
    await browser.randomDelay(2000, 4000);
    
    // 7. Vérifier le résultat de la connexion
    
    // Vérifier si un CAPTCHA est apparu après soumission
    const captchaAfter = await page.$(SELECTORS.captchaFrame);
    if (captchaAfter) {
      logs.push(createLog('⚠️ CAPTCHA déclenché après la soumission'));
      await browser.takeScreenshot('captcha_after_submit');
      
      return {
        success: false,
        error: 'CAPTCHA déclenché. Le compte est peut-être surveillé.',
        errorType: 'captcha',
        logs,
      };
    }
    
    // Vérifier s'il y a une erreur de connexion
    const errorElement = await page.$(SELECTORS.loginError);
    if (errorElement) {
      const errorText = await errorElement.textContent();
      logs.push(createLog(`❌ Erreur de connexion: ${errorText}`));
      await browser.takeScreenshot('login_error');
      
      // Analyser le type d'erreur
      const errorLower = (errorText || '').toLowerCase();
      let errorType: AuthResult['errorType'] = 'invalid_credentials';
      
      if (errorLower.includes('bloqué') || errorLower.includes('blocked') || errorLower.includes('suspendu')) {
        errorType = 'blocked';
      }
      
      return {
        success: false,
        error: errorText || 'Identifiants invalides',
        errorType,
        logs,
      };
    }
    
    // Attendre l'apparition du menu utilisateur (signe de connexion réussie)
    try {
      await page.waitForSelector(
        `${SELECTORS.userMenu}, ${SELECTORS.accountIcon}`,
        { timeout: 10000 }
      );
      
      logs.push(createLog('✅ Connexion réussie!'));
      await browser.takeScreenshot('login_success');
      
      // 8. Sauvegarder les cookies de session
      const cookies = await browser.saveCookies();
      logs.push(createLog(`${cookies.length} cookies de session sauvegardés`));
      
      // Créer la session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRATION_HOURS);
      
      const session: LeboncoinSession = {
        accountId: credentials.id,
        cookies,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        isValid: true,
      };
      
      return {
        success: true,
        session,
        logs,
      };
      
    } catch (error) {
      // Timeout en attendant le menu utilisateur
      logs.push(createLog('⏰ Timeout en attendant la confirmation de connexion'));
      await browser.takeScreenshot('login_timeout');
      
      // Vérifier l'URL actuelle pour plus d'indices
      const currentUrl = page.url();
      logs.push(createLog(`URL actuelle: ${currentUrl}`));
      
      // Si on est toujours sur la page de login, la connexion a probablement échoué
      if (currentUrl.includes('/login')) {
        return {
          success: false,
          error: 'La connexion semble avoir échoué. Vérifiez vos identifiants.',
          errorType: 'invalid_credentials',
          logs,
        };
      }
      
      // Autre erreur
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la connexion',
        errorType: 'unknown',
        logs,
      };
    }
    
  } catch (error) {
    logs.push(createLog(`❌ Erreur: ${error instanceof Error ? error.message : String(error)}`));
    await browser.takeScreenshot('login_exception');
    
    // Déterminer le type d'erreur
    let errorType: AuthResult['errorType'] = 'unknown';
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('net::') || errorMessage.includes('timeout')) {
      errorType = 'network';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      logs,
    };
  }
}

/**
 * Vérifie si une session est toujours valide
 * 
 * @param browser - Instance du navigateur
 * @param session - Session à vérifier
 * @returns true si la session est valide
 */
export async function checkSession(
  browser: LeboncoinBrowser,
  session: LeboncoinSession
): Promise<{ valid: boolean; logs: string[] }> {
  const logs: string[] = [];
  const page = browser.getPage();
  
  logs.push(createLog('Vérification de la session...'));
  
  try {
    // Vérifier si la session n'est pas expirée
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now > expiresAt) {
      logs.push(createLog('Session expirée (date d\'expiration dépassée)'));
      return { valid: false, logs };
    }
    
    // Charger les cookies de session
    await browser.loadCookies(session.cookies);
    logs.push(createLog(`${session.cookies.length} cookies chargés`));
    
    // Naviguer vers Leboncoin
    await page.goto(LEBONCOIN_URL, { waitUntil: 'domcontentloaded' });
    await browser.randomDelay(1000, 2000);
    
    // Accepter les cookies si nécessaire
    try {
      const cookieButton = await page.$(SELECTORS.acceptCookies);
      if (cookieButton) {
        await cookieButton.click();
        await browser.randomDelay(500, 1000);
      }
    } catch {
      // Ignorer
    }
    
    // Vérifier si l'utilisateur est connecté
    const userMenu = await page.$(SELECTORS.userMenu);
    const accountIcon = await page.$(SELECTORS.accountIcon);
    
    if (userMenu || accountIcon) {
      logs.push(createLog('✅ Session valide - utilisateur connecté'));
      return { valid: true, logs };
    }
    
    // Essayer de naviguer vers une page de compte
    await page.goto(`${LEBONCOIN_URL}/compte/`, { waitUntil: 'domcontentloaded' });
    await browser.randomDelay(1000, 2000);
    
    // Si redirigé vers login, la session n'est plus valide
    if (page.url().includes('/login')) {
      logs.push(createLog('Session invalide - redirigé vers la page de connexion'));
      return { valid: false, logs };
    }
    
    logs.push(createLog('✅ Session valide'));
    return { valid: true, logs };
    
  } catch (error) {
    logs.push(createLog(`Erreur lors de la vérification: ${error instanceof Error ? error.message : String(error)}`));
    return { valid: false, logs };
  }
}

/**
 * Se déconnecte du compte Leboncoin
 * 
 * @param browser - Instance du navigateur
 * @returns Logs de l'opération
 */
export async function logoutFromLeboncoin(browser: LeboncoinBrowser): Promise<string[]> {
  const logs: string[] = [];
  const page = browser.getPage();
  
  logs.push(createLog('Déconnexion du compte Leboncoin...'));
  
  try {
    // Naviguer vers la page de compte
    await page.goto(`${LEBONCOIN_URL}/compte/`, { waitUntil: 'domcontentloaded' });
    await browser.randomDelay(1000, 2000);
    
    // Chercher et cliquer sur le bouton de déconnexion
    const logoutButton = await page.$(SELECTORS.logoutButton);
    
    if (logoutButton) {
      await browser.humanClick(SELECTORS.logoutButton);
      await browser.randomDelay(1000, 2000);
      logs.push(createLog('✅ Déconnexion réussie'));
    } else {
      // Méthode alternative: effacer les cookies
      await browser.clearCookies();
      logs.push(createLog('Cookies effacés (bouton de déconnexion non trouvé)'));
    }
    
  } catch (error) {
    logs.push(createLog(`Erreur lors de la déconnexion: ${error instanceof Error ? error.message : String(error)}`));
    // Effacer les cookies en cas d'erreur
    await browser.clearCookies();
  }
  
  return logs;
}

/**
 * Renouvelle une session existante
 * 
 * @param browser - Instance du navigateur
 * @param session - Ancienne session
 * @param credentials - Identifiants pour se reconnecter
 * @returns Nouvelle session ou erreur
 */
export async function renewSession(
  browser: LeboncoinBrowser,
  session: LeboncoinSession,
  credentials: AccountCredentials
): Promise<AuthResult> {
  const logs: string[] = [];
  
  logs.push(createLog('Renouvellement de la session...'));
  
  // Vérifier si la session actuelle est encore valide
  const { valid, logs: checkLogs } = await checkSession(browser, session);
  logs.push(...checkLogs);
  
  if (valid) {
    // Mettre à jour la date d'expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRATION_HOURS);
    
    const newCookies = await browser.saveCookies();
    
    const renewedSession: LeboncoinSession = {
      ...session,
      cookies: newCookies,
      expiresAt: expiresAt.toISOString(),
    };
    
    logs.push(createLog('Session renouvelée avec succès'));
    
    return {
      success: true,
      session: renewedSession,
      logs,
    };
  }
  
  // Sinon, se reconnecter
  logs.push(createLog('Session expirée, reconnexion nécessaire...'));
  
  // Effacer les anciens cookies
  await browser.clearCookies();
  
  // Se reconnecter
  const authResult = await loginToLeboncoin(browser, credentials);
  
  return {
    ...authResult,
    logs: [...logs, ...authResult.logs],
  };
}

export { SELECTORS, LEBONCOIN_URL, LOGIN_URL, SESSION_EXPIRATION_HOURS };
