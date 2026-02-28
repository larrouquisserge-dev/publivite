/**
 * Types TypeScript pour l'intégration Leboncoin
 * Module d'automatisation de publication d'annonces via Playwright
 */

/**
 * Identifiants d'un compte Leboncoin
 */
export interface AccountCredentials {
  id: string;
  email: string;
  password: string;
  name?: string;
}

/**
 * Cookies de session Leboncoin
 */
export interface SessionCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Session Leboncoin sauvegardée
 */
export interface LeboncoinSession {
  accountId: string;
  cookies: SessionCookie[];
  createdAt: string;
  expiresAt: string;
  isValid: boolean;
}

/**
 * Image d'une annonce
 */
export interface AdImage {
  id: string;
  url: string;        // URL ou chemin local de l'image
  filename: string;
  order: number;
}

/**
 * Champ dynamique d'une annonce (basé sur la catégorie)
 */
export interface AdField {
  name: string;
  value: string | string[] | number | boolean;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'toggle' | 'date' | 'textarea';
}

/**
 * Données complètes d'une annonce à publier
 */
export interface AdData {
  id: string;
  title: string;
  description: string;
  price?: number;
  category: string;           // Valeur de la catégorie (ex: "voitures")
  categoryLabel: string;      // Label de la catégorie (ex: "Voitures")
  images: AdImage[];
  fields: AdField[];          // Champs spécifiques à la catégorie
  isPro: boolean;             // Compte Pro ou Particulier
  showPhone: boolean;         // Afficher le numéro de téléphone
  phoneNumber?: string;
  tags?: string[];
  deliveryOptions?: string[]; // Options de livraison
}

/**
 * Ville pour la publication
 */
export interface City {
  name: string;
  zipCode: string;
}

/**
 * Types d'erreurs possibles lors de la publication
 */
export type PublishErrorType = 
  | 'captcha'              // CAPTCHA détecté
  | 'blocked'              // Compte bloqué
  | 'limit_reached'        // Limite de publications atteinte
  | 'invalid_credentials'  // Identifiants invalides
  | 'network'              // Erreur réseau
  | 'timeout'              // Timeout
  | 'form_validation'      // Erreur de validation du formulaire
  | 'upload_failed'        // Échec d'upload d'images
  | 'session_expired'      // Session expirée
  | 'unknown';             // Erreur inconnue

/**
 * Résultat d'une tentative de publication
 */
export interface PublishResult {
  success: boolean;
  adUrl?: string;           // URL de l'annonce publiée
  error?: string;           // Message d'erreur
  errorType?: PublishErrorType;
  screenshots?: string[];   // Chemins des captures d'écran de debugging
  logs: string[];           // Logs détaillés de l'exécution
  duration?: number;        // Durée en ms
  city: string;             // Ville de la publication
  timestamp: string;        // Horodatage
}

/**
 * Résultat de l'authentification
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  errorType?: 'invalid_credentials' | 'captcha' | 'blocked' | 'network' | 'unknown';
  session?: LeboncoinSession;
  logs: string[];
}

/**
 * Configuration du navigateur
 */
export interface BrowserConfig {
  headless: boolean;        // Mode headless (sans interface graphique)
  slowMo?: number;          // Ralentir les actions (en ms) pour simuler comportement humain
  timeout?: number;         // Timeout par défaut en ms
  screenshotOnError?: boolean;
  screenshotDir?: string;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
}

/**
 * Options pour la fonction de publication
 */
export interface PublishOptions {
  browserConfig?: Partial<BrowserConfig>;
  maxRetries?: number;
  retryDelayMs?: number;
  useExistingSession?: boolean;
  saveSession?: boolean;
}

/**
 * Statistiques d'une session de publication
 */
export interface PublishStats {
  totalAttempts: number;
  successful: number;
  failed: number;
  captchaEncountered: number;
  averageDuration: number;
  errors: { type: PublishErrorType; count: number }[];
}

/**
 * Log entry pour le debugging
 */
export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

/**
 * État du navigateur
 */
export interface BrowserState {
  isInitialized: boolean;
  isLoggedIn: boolean;
  currentPage?: string;
  lastActivity?: string;
}

/**
 * Configuration de retry avec backoff exponentiel
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  retryableErrors: PublishErrorType[];
}

/**
 * Sélecteurs CSS/XPath pour les éléments Leboncoin
 * (Ces sélecteurs peuvent changer si Leboncoin modifie son interface)
 */
export interface LeboncoinSelectors {
  // Navigation
  loginButton: string;
  publishButton: string;
  
  // Formulaire de connexion
  emailInput: string;
  passwordInput: string;
  submitLoginButton: string;
  
  // Formulaire d'annonce
  categorySelect: string;
  titleInput: string;
  descriptionTextarea: string;
  priceInput: string;
  imageUpload: string;
  cityInput: string;
  phoneInput: string;
  submitAdButton: string;
  
  // Validation et confirmation
  successMessage: string;
  errorMessage: string;
  captchaFrame: string;
  
  // Éléments de compte
  accountMenu: string;
  logoutButton: string;
}

/**
 * Mapping des catégories Leboncoin vers leurs identifiants
 */
export interface CategoryMapping {
  label: string;
  value: string;
  lbcId?: string;     // ID interne Leboncoin si nécessaire
  parentCategory?: string;
}

/**
 * Configuration pour le rate limiting
 */
export interface RateLimitConfig {
  maxConcurrent: number;      // Nombre max de publications simultanées
  minDelayBetweenAds: number; // Délai minimum entre deux publications (ms)
  maxAdsPerHour: number;      // Max d'annonces par heure
  maxAdsPerDay: number;       // Max d'annonces par jour
  randomDelayRange: {         // Délai aléatoire pour simuler comportement humain
    min: number;
    max: number;
  };
}
