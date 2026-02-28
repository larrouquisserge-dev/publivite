/**
 * Module d'intégration Leboncoin
 * 
 * Export principal de toutes les fonctions et types
 * pour l'automatisation des publications sur Leboncoin.
 */

// Types
export type {
  AccountCredentials,
  SessionCookie,
  LeboncoinSession,
  AdImage,
  AdField,
  AdData,
  City,
  PublishErrorType,
  PublishResult,
  AuthResult,
  BrowserConfig,
  PublishOptions,
  PublishStats,
  LogEntry,
  BrowserState,
  RetryConfig,
  LeboncoinSelectors,
  CategoryMapping,
  RateLimitConfig,
} from './types';

// Browser
export {
  LeboncoinBrowser,
  createBrowser,
  withBrowser,
  DEFAULT_USER_AGENT,
  DEFAULT_VIEWPORT,
  DEFAULT_CONFIG,
} from './browser';

// Authentification
export {
  loginToLeboncoin,
  checkSession,
  logoutFromLeboncoin,
  renewSession,
  SELECTORS as AUTH_SELECTORS,
  LEBONCOIN_URL,
  LOGIN_URL,
  SESSION_EXPIRATION_HOURS,
} from './auth';

// Publication
export {
  publishAd,
  publishAdWithRetry,
  PUBLISH_SELECTORS,
  PUBLISH_URL,
} from './publisher';

// Crypto
export {
  encrypt,
  decrypt,
  isEncrypted,
  generateEncryptionKey,
  hashPassword,
  encryptJSON,
  decryptJSON,
  maskEmail,
  maskPassword,
} from './crypto';

/**
 * Configuration du rate limiting par défaut
 */
export const DEFAULT_RATE_LIMIT: import('./types').RateLimitConfig = {
  maxConcurrent: 2,           // Maximum 2 publications simultanées
  minDelayBetweenAds: 30000,  // 30 secondes minimum entre deux publications
  maxAdsPerHour: 10,          // Maximum 10 annonces par heure
  maxAdsPerDay: 50,           // Maximum 50 annonces par jour
  randomDelayRange: {
    min: 5000,                // 5 secondes minimum
    max: 15000,               // 15 secondes maximum
  },
};

/**
 * Vérifie si le module Playwright est correctement installé
 */
export async function checkPlaywrightInstallation(): Promise<{
  installed: boolean;
  browserPath?: string;
  error?: string;
}> {
  try {
    const { chromium } = await import('playwright');
    const browserPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '/home/ubuntu/.playwright-browsers';
    
    return {
      installed: true,
      browserPath,
    };
  } catch (error) {
    return {
      installed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Teste rapidement la connexion à Leboncoin
 */
export async function testLeboncoinConnection(
  credentials: import('./types').AccountCredentials
): Promise<{
  success: boolean;
  error?: string;
  logs: string[];
}> {
  const { createBrowser, LeboncoinBrowser } = await import('./browser');
  const { loginToLeboncoin, logoutFromLeboncoin } = await import('./auth');
  const { maskEmail } = await import('./crypto');
  
  const logs: string[] = [];
  let browser: InstanceType<typeof LeboncoinBrowser> | null = null;
  
  try {
    logs.push(`Test de connexion pour ${maskEmail(credentials.email)}`);
    
    browser = await createBrowser({ headless: true });
    const authResult = await loginToLeboncoin(browser, credentials);
    
    logs.push(...authResult.logs);
    
    if (authResult.success) {
      // Se déconnecter proprement
      const logoutLogs = await logoutFromLeboncoin(browser);
      logs.push(...logoutLogs);
    }
    
    return {
      success: authResult.success,
      error: authResult.error,
      logs,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logs.push(`Erreur: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage,
      logs,
    };
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
