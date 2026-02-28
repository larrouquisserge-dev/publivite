/**
 * Gestion du navigateur Playwright pour l'automatisation Leboncoin
 * 
 * Ce module gère l'initialisation, la configuration et la fermeture
 * des instances de navigateur Chromium simulant Chrome sur Windows.
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { BrowserConfig, SessionCookie, LogEntry } from './types';
import * as path from 'path';
import * as fs from 'fs';

// Chemin vers les navigateurs Playwright
const BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/home/ubuntu/.playwright-browsers';

// User-Agent simulant Chrome 139 sur Windows
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

// Configuration par défaut du navigateur
const DEFAULT_CONFIG: BrowserConfig = {
  headless: true,
  slowMo: 50,              // 50ms entre chaque action
  timeout: 30000,          // 30 secondes timeout par défaut
  screenshotOnError: true,
  screenshotDir: '/home/ubuntu/lbc-manager/uploads/screenshots',
};

// Viewport standard (résolution courante)
const DEFAULT_VIEWPORT = {
  width: 1920,
  height: 1080,
};

/**
 * Classe de gestion du navigateur
 */
export class LeboncoinBrowser {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;
  private logs: LogEntry[] = [];

  constructor(config: Partial<BrowserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Créer le dossier des screenshots s'il n'existe pas
    if (this.config.screenshotDir && !fs.existsSync(this.config.screenshotDir)) {
      fs.mkdirSync(this.config.screenshotDir, { recursive: true });
    }
  }

  /**
   * Ajoute une entrée de log
   */
  private log(level: LogEntry['level'], message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
    this.logs.push(entry);
    
    // Console log pour debugging en développement
    const prefix = `[LBC Browser] [${level.toUpperCase()}]`;
    if (level === 'error') {
      console.error(prefix, message, data || '');
    } else if (level === 'warn') {
      console.warn(prefix, message, data || '');
    } else {
      console.log(prefix, message, data || '');
    }
  }

  /**
   * Récupère les logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Efface les logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Initialise le navigateur Chromium
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      this.log('warn', 'Le navigateur est déjà initialisé');
      return;
    }

    this.log('info', 'Initialisation du navigateur Chromium...', {
      headless: this.config.headless,
      slowMo: this.config.slowMo,
    });

    try {
      // Lancer le navigateur
      this.browser = await chromium.launch({
        headless: this.config.headless,
        slowMo: this.config.slowMo,
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
        args: [
          '--disable-blink-features=AutomationControlled', // Éviter la détection d'automatisation
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-size=1920,1080',
          '--start-maximized',
        ],
      });

      // Créer un contexte avec les paramètres
      this.context = await this.browser.newContext({
        userAgent: DEFAULT_USER_AGENT,
        viewport: DEFAULT_VIEWPORT,
        locale: 'fr-FR',
        timezoneId: 'Europe/Paris',
        geolocation: { latitude: 48.8566, longitude: 2.3522 }, // Paris par défaut
        permissions: ['geolocation'],
        extraHTTPHeaders: {
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        // Ignorer les certificats HTTPS invalides (pour les proxies)
        ignoreHTTPSErrors: true,
      });

      // Ajouter des scripts d'initialisation pour éviter la détection
      await this.context.addInitScript(() => {
        // Masquer webdriver
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        // Masquer les propriétés d'automatisation
        // @ts-expect-error - propriété personnalisée
        window.chrome = {
          runtime: {},
        };
        
        // Permissions simulées
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) =>
          // @ts-expect-error - type étendu
          parameters.name === 'notifications'
            ? Promise.resolve({ state: 'denied', onchange: null })
            : originalQuery(parameters);
        
        // Plugins simulés
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            { name: 'Chrome PDF Plugin' },
            { name: 'Chrome PDF Viewer' },
            { name: 'Native Client' },
          ],
        });
        
        // Languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['fr-FR', 'fr', 'en-US', 'en'],
        });
      });

      // Créer la première page
      this.page = await this.context.newPage();

      // Définir les timeouts par défaut
      this.page.setDefaultTimeout(this.config.timeout || 30000);
      this.page.setDefaultNavigationTimeout(this.config.timeout || 30000);

      this.log('info', 'Navigateur initialisé avec succès');
    } catch (error) {
      this.log('error', 'Erreur lors de l\'initialisation du navigateur', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Récupère la page courante
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Le navigateur n\'est pas initialisé. Appelez initialize() d\'abord.');
    }
    return this.page;
  }

  /**
   * Récupère le contexte du navigateur
   */
  getContext(): BrowserContext {
    if (!this.context) {
      throw new Error('Le navigateur n\'est pas initialisé. Appelez initialize() d\'abord.');
    }
    return this.context;
  }

  /**
   * Charge les cookies de session
   */
  async loadCookies(cookies: SessionCookie[]): Promise<void> {
    if (!this.context) {
      throw new Error('Le navigateur n\'est pas initialisé');
    }

    this.log('info', `Chargement de ${cookies.length} cookies de session`);

    try {
      await this.context.addCookies(
        cookies.map(cookie => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expires,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite,
        }))
      );
      this.log('info', 'Cookies chargés avec succès');
    } catch (error) {
      this.log('error', 'Erreur lors du chargement des cookies', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Sauvegarde les cookies de session actuels
   */
  async saveCookies(): Promise<SessionCookie[]> {
    if (!this.context) {
      throw new Error('Le navigateur n\'est pas initialisé');
    }

    this.log('info', 'Sauvegarde des cookies de session');

    try {
      const cookies = await this.context.cookies();
      this.log('info', `${cookies.length} cookies sauvegardés`);
      
      return cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as SessionCookie['sameSite'],
      }));
    } catch (error) {
      this.log('error', 'Erreur lors de la sauvegarde des cookies', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Efface tous les cookies
   */
  async clearCookies(): Promise<void> {
    if (!this.context) {
      throw new Error('Le navigateur n\'est pas initialisé');
    }

    this.log('info', 'Effacement des cookies');
    await this.context.clearCookies();
  }

  /**
   * Prend une capture d'écran
   */
  async takeScreenshot(name: string): Promise<string | null> {
    if (!this.page || !this.config.screenshotDir) {
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    const filepath = path.join(this.config.screenshotDir, filename);

    try {
      await this.page.screenshot({ path: filepath, fullPage: true });
      this.log('info', `Capture d'écran sauvegardée: ${filename}`);
      return filepath;
    } catch (error) {
      this.log('error', 'Erreur lors de la capture d\'écran', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Ajoute un délai aléatoire pour simuler un comportement humain
   */
  async randomDelay(minMs: number = 500, maxMs: number = 2000): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    this.log('debug', `Délai aléatoire: ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simule un mouvement de souris vers un élément
   */
  async humanMove(selector: string): Promise<void> {
    const page = this.getPage();
    const element = await page.$(selector);
    
    if (element) {
      const box = await element.boundingBox();
      if (box) {
        // Mouvement vers un point aléatoire dans l'élément
        const x = box.x + Math.random() * box.width;
        const y = box.y + Math.random() * box.height;
        await page.mouse.move(x, y, { steps: 10 });
      }
    }
  }

  /**
   * Tape du texte de manière humaine (avec des pauses entre les caractères)
   */
  async humanType(selector: string, text: string): Promise<void> {
    const page = this.getPage();
    await this.humanMove(selector);
    await this.randomDelay(100, 300);
    
    // Taper caractère par caractère avec des délais variables
    await page.click(selector);
    for (const char of text) {
      await page.keyboard.type(char, { delay: Math.random() * 100 + 50 });
    }
  }

  /**
   * Clique de manière humaine
   */
  async humanClick(selector: string): Promise<void> {
    const page = this.getPage();
    await this.humanMove(selector);
    await this.randomDelay(50, 150);
    await page.click(selector);
  }

  /**
   * Vérifie si le navigateur est initialisé
   */
  isInitialized(): boolean {
    return this.browser !== null && this.context !== null && this.page !== null;
  }

  /**
   * Ferme proprement le navigateur
   */
  async close(): Promise<void> {
    this.log('info', 'Fermeture du navigateur...');

    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.log('info', 'Navigateur fermé avec succès');
    } catch (error) {
      this.log('error', 'Erreur lors de la fermeture du navigateur', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

/**
 * Crée une nouvelle instance de navigateur configurée
 */
export async function createBrowser(config?: Partial<BrowserConfig>): Promise<LeboncoinBrowser> {
  const browser = new LeboncoinBrowser(config);
  await browser.initialize();
  return browser;
}

/**
 * Fonction utilitaire pour exécuter une action avec le navigateur
 * et le fermer automatiquement après (même en cas d'erreur)
 */
export async function withBrowser<T>(
  action: (browser: LeboncoinBrowser) => Promise<T>,
  config?: Partial<BrowserConfig>
): Promise<T> {
  const browser = await createBrowser(config);
  
  try {
    return await action(browser);
  } finally {
    await browser.close();
  }
}

export { DEFAULT_USER_AGENT, DEFAULT_VIEWPORT, DEFAULT_CONFIG };
