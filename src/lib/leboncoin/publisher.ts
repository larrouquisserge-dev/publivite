/**
 * Publication d'annonces sur Leboncoin via Playwright
 * 
 * Ce module gère le remplissage automatique des formulaires d'annonces,
 * l'upload des images et la soumission sur Leboncoin.
 */

import { LeboncoinBrowser, createBrowser } from './browser';
import { loginToLeboncoin, checkSession, LEBONCOIN_URL } from './auth';
import {
  AdData,
  AccountCredentials,
  City,
  PublishResult,
  PublishOptions,
  LeboncoinSession,
  PublishErrorType,
  RetryConfig,
} from './types';
import { decrypt } from './crypto';
import * as path from 'path';
import * as fs from 'fs';

// URL pour déposer une annonce
const PUBLISH_URL = 'https://www.leboncoin.fr/deposer-une-annonce';

// Configuration de retry par défaut
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
  multiplier: 2,
  retryableErrors: ['network', 'timeout', 'session_expired'],
};

// Sélecteurs CSS pour le formulaire de publication
// NOTE: Ces sélecteurs peuvent changer si Leboncoin modifie son interface
const PUBLISH_SELECTORS = {
  // Bannière cookies
  acceptCookies: '[data-testid="didomi-accept-button"], #didomi-notice-agree-button',
  
  // Sélection de catégorie
  categoryContainer: '[data-testid="category-selector"], [class*="category"]',
  categorySearch: 'input[placeholder*="catégorie"], input[data-testid="category-search"]',
  categoryOption: '[data-testid="category-option"], [class*="categoryOption"]',
  
  // Champs principaux
  titleInput: 'input[name="subject"], input[data-testid="ad-title"], #subject',
  descriptionTextarea: 'textarea[name="body"], textarea[data-testid="ad-body"], #body',
  priceInput: 'input[name="price"], input[data-testid="ad-price"], #price',
  
  // Type de vendeur
  proToggle: 'input[name="is_pro"], [data-testid="pro-toggle"]',
  particularOption: '[data-value="particular"], label[for*="particular"]',
  proOption: '[data-value="pro"], label[for*="pro"]',
  
  // Localisation
  cityInput: 'input[name="location"], input[data-testid="location-search"], input[placeholder*="ville"]',
  citySuggestion: '[data-testid="location-suggestion"], [class*="suggestion"]',
  
  // Téléphone
  phoneInput: 'input[name="phone"], input[type="tel"], #phone',
  showPhoneToggle: 'input[name="show_phone"], [data-testid="show-phone"]',
  
  // Images
  imageUpload: 'input[type="file"], input[accept*="image"]',
  imagePreview: '[data-testid="image-preview"], [class*="imagePreview"]',
  removeImage: '[data-testid="remove-image"], button[class*="remove"]',
  
  // Champs dynamiques (attributs spécifiques à la catégorie)
  attributeSelect: 'select[name^="attributes."], [data-testid^="attribute-"]',
  attributeInput: 'input[name^="attributes."], [data-testid^="attribute-"]',
  attributeCheckbox: 'input[type="checkbox"][name^="attributes."]',
  
  // Soumission
  submitButton: 'button[type="submit"], button[data-testid="submit-ad"], button[class*="submit"]',
  publishButton: 'button[data-testid="publish"], button[class*="publish"]',
  
  // Messages de résultat
  successMessage: '[data-testid="success"], [class*="success"], [class*="Success"]',
  errorMessage: '[data-testid="error"], [class*="error"], [class*="Error"]',
  captchaFrame: 'iframe[src*="recaptcha"], iframe[src*="hcaptcha"], [class*="captcha"]',
  
  // Limite de publications
  limitMessage: '[class*="limit"], [data-testid="publication-limit"]',
};

/**
 * Crée un log formaté
 */
function createLog(message: string): string {
  return `[${new Date().toISOString()}] ${message}`;
}

/**
 * Attend un délai avec backoff exponentiel
 */
async function exponentialBackoff(
  attempt: number,
  config: RetryConfig
): Promise<void> {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.multiplier, attempt),
    config.maxDelayMs
  );
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Sélectionne une catégorie dans le formulaire
 */
async function selectCategory(
  browser: LeboncoinBrowser,
  categoryLabel: string,
  logs: string[]
): Promise<boolean> {
  const page = browser.getPage();
  
  logs.push(createLog(`Sélection de la catégorie: ${categoryLabel}`));
  
  try {
    // Chercher et cliquer sur le sélecteur de catégorie
    const categoryContainer = await page.$(PUBLISH_SELECTORS.categoryContainer);
    if (categoryContainer) {
      await browser.humanClick(PUBLISH_SELECTORS.categoryContainer);
      await browser.randomDelay(500, 1000);
    }
    
    // Chercher la catégorie par son nom
    const categorySearch = await page.$(PUBLISH_SELECTORS.categorySearch);
    if (categorySearch) {
      await browser.humanType(PUBLISH_SELECTORS.categorySearch, categoryLabel);
      await browser.randomDelay(500, 1000);
    }
    
    // Cliquer sur l'option de catégorie
    const categoryOption = await page.$(`text="${categoryLabel}"`);
    if (categoryOption) {
      await categoryOption.click();
      await browser.randomDelay(500, 1000);
      logs.push(createLog('✅ Catégorie sélectionnée'));
      return true;
    }
    
    // Alternative: chercher par data-value ou class
    const optionAlt = await page.$(`[data-value="${categoryLabel}"], [data-category="${categoryLabel}"]`);
    if (optionAlt) {
      await optionAlt.click();
      await browser.randomDelay(500, 1000);
      logs.push(createLog('✅ Catégorie sélectionnée (méthode alternative)'));
      return true;
    }
    
    logs.push(createLog(`⚠️ Catégorie non trouvée: ${categoryLabel}`));
    return false;
    
  } catch (error) {
    logs.push(createLog(`❌ Erreur lors de la sélection de catégorie: ${error}`));
    return false;
  }
}

/**
 * Remplit les champs principaux de l'annonce
 */
async function fillMainFields(
  browser: LeboncoinBrowser,
  adData: AdData,
  logs: string[]
): Promise<boolean> {
  const page = browser.getPage();
  
  try {
    // Titre
    logs.push(createLog(`Saisie du titre: ${adData.title.substring(0, 30)}...`));
    const titleInput = await page.$(PUBLISH_SELECTORS.titleInput);
    if (titleInput) {
      await browser.humanType(PUBLISH_SELECTORS.titleInput, adData.title);
      await browser.randomDelay(300, 600);
    } else {
      logs.push(createLog('⚠️ Champ titre non trouvé'));
    }
    
    // Description
    logs.push(createLog('Saisie de la description...'));
    const descInput = await page.$(PUBLISH_SELECTORS.descriptionTextarea);
    if (descInput) {
      await browser.humanType(PUBLISH_SELECTORS.descriptionTextarea, adData.description);
      await browser.randomDelay(300, 600);
    } else {
      logs.push(createLog('⚠️ Champ description non trouvé'));
    }
    
    // Prix (si défini)
    if (adData.price !== undefined && adData.price > 0) {
      logs.push(createLog(`Saisie du prix: ${adData.price}€`));
      const priceInput = await page.$(PUBLISH_SELECTORS.priceInput);
      if (priceInput) {
        await browser.humanType(PUBLISH_SELECTORS.priceInput, String(adData.price));
        await browser.randomDelay(300, 600);
      }
    }
    
    return true;
    
  } catch (error) {
    logs.push(createLog(`❌ Erreur lors du remplissage des champs: ${error}`));
    return false;
  }
}

/**
 * Remplit les champs dynamiques spécifiques à la catégorie
 */
async function fillDynamicFields(
  browser: LeboncoinBrowser,
  adData: AdData,
  logs: string[]
): Promise<boolean> {
  const page = browser.getPage();
  
  logs.push(createLog(`Remplissage de ${adData.fields.length} champs spécifiques...`));
  
  for (const field of adData.fields) {
    try {
      const selector = `[name="${field.name}"], [name="attributes.${field.name}"], [data-testid="${field.name}"]`;
      
      switch (field.type) {
        case 'text':
        case 'number':
        case 'textarea':
          const input = await page.$(selector);
          if (input) {
            await browser.humanType(selector, String(field.value));
            await browser.randomDelay(200, 400);
            logs.push(createLog(`✓ ${field.name}: ${String(field.value).substring(0, 20)}...`));
          }
          break;
          
        case 'select':
          const select = await page.$(selector);
          if (select) {
            await page.selectOption(selector, String(field.value));
            await browser.randomDelay(200, 400);
            logs.push(createLog(`✓ ${field.name}: ${field.value}`));
          }
          break;
          
        case 'multi-select':
          if (Array.isArray(field.value)) {
            for (const val of field.value) {
              const checkbox = await page.$(`input[name="${field.name}"][value="${val}"], [data-value="${val}"]`);
              if (checkbox) {
                await checkbox.click();
                await browser.randomDelay(100, 200);
              }
            }
            logs.push(createLog(`✓ ${field.name}: ${field.value.join(', ')}`));
          }
          break;
          
        case 'toggle':
          if (field.value === true) {
            const toggle = await page.$(selector);
            if (toggle) {
              await toggle.click();
              await browser.randomDelay(200, 400);
              logs.push(createLog(`✓ ${field.name}: activé`));
            }
          }
          break;
          
        case 'date':
          const dateInput = await page.$(selector);
          if (dateInput) {
            await browser.humanType(selector, String(field.value));
            await browser.randomDelay(200, 400);
            logs.push(createLog(`✓ ${field.name}: ${field.value}`));
          }
          break;
      }
      
    } catch (error) {
      logs.push(createLog(`⚠️ Impossible de remplir ${field.name}: ${error}`));
      // Continuer avec les autres champs même si un échoue
    }
  }
  
  return true;
}

/**
 * Remplit la localisation (ville)
 */
async function fillLocation(
  browser: LeboncoinBrowser,
  city: City,
  logs: string[]
): Promise<boolean> {
  const page = browser.getPage();
  
  logs.push(createLog(`Saisie de la localisation: ${city.name} (${city.zipCode})`));
  
  try {
    const cityInput = await page.$(PUBLISH_SELECTORS.cityInput);
    if (!cityInput) {
      logs.push(createLog('⚠️ Champ ville non trouvé'));
      return false;
    }
    
    // Saisir le code postal ou le nom de la ville
    const searchTerm = city.zipCode || city.name;
    await browser.humanType(PUBLISH_SELECTORS.cityInput, searchTerm);
    await browser.randomDelay(1000, 1500);
    
    // Attendre et sélectionner la suggestion
    try {
      await page.waitForSelector(PUBLISH_SELECTORS.citySuggestion, { timeout: 5000 });
      await browser.randomDelay(300, 500);
      
      // Cliquer sur la première suggestion correspondante
      const suggestion = await page.$(`${PUBLISH_SELECTORS.citySuggestion}:has-text("${city.name}")`);
      if (suggestion) {
        await suggestion.click();
      } else {
        // Cliquer sur la première suggestion
        await page.click(PUBLISH_SELECTORS.citySuggestion);
      }
      
      await browser.randomDelay(300, 500);
      logs.push(createLog('✅ Localisation sélectionnée'));
      return true;
      
    } catch {
      logs.push(createLog('⚠️ Pas de suggestion de ville, validation manuelle'));
      // Essayer de valider avec Entrée
      await page.keyboard.press('Enter');
      return true;
    }
    
  } catch (error) {
    logs.push(createLog(`❌ Erreur localisation: ${error}`));
    return false;
  }
}

/**
 * Upload les images de l'annonce
 */
async function uploadImages(
  browser: LeboncoinBrowser,
  images: AdData['images'],
  logs: string[]
): Promise<boolean> {
  const page = browser.getPage();
  
  if (!images || images.length === 0) {
    logs.push(createLog('Aucune image à uploader'));
    return true;
  }
  
  logs.push(createLog(`Upload de ${images.length} image(s)...`));
  
  try {
    // Trouver l'input de fichier
    const fileInput = await page.$(PUBLISH_SELECTORS.imageUpload);
    if (!fileInput) {
      logs.push(createLog('⚠️ Champ upload d\'images non trouvé'));
      return false;
    }
    
    // Trier les images par ordre
    const sortedImages = [...images].sort((a, b) => a.order - b.order);
    
    for (const image of sortedImages) {
      try {
        // Vérifier que le fichier existe
        const imagePath = image.url.startsWith('/') ? image.url : path.resolve(image.url);
        
        if (!fs.existsSync(imagePath)) {
          logs.push(createLog(`⚠️ Image non trouvée: ${image.filename}`));
          continue;
        }
        
        // Upload le fichier
        await fileInput.setInputFiles(imagePath);
        logs.push(createLog(`✓ Image uploadée: ${image.filename}`));
        
        // Attendre le traitement de l'image
        await browser.randomDelay(1500, 3000);
        
        // Attendre que la preview apparaisse
        try {
          await page.waitForSelector(PUBLISH_SELECTORS.imagePreview, { timeout: 10000 });
        } catch {
          logs.push(createLog('⚠️ Preview de l\'image non détectée'));
        }
        
      } catch (error) {
        logs.push(createLog(`❌ Erreur upload image ${image.filename}: ${error}`));
      }
    }
    
    return true;
    
  } catch (error) {
    logs.push(createLog(`❌ Erreur lors de l'upload des images: ${error}`));
    return false;
  }
}

/**
 * Configure les options de téléphone
 */
async function configurePhone(
  browser: LeboncoinBrowser,
  adData: AdData,
  logs: string[]
): Promise<void> {
  const page = browser.getPage();
  
  try {
    // Numéro de téléphone
    if (adData.phoneNumber) {
      const phoneInput = await page.$(PUBLISH_SELECTORS.phoneInput);
      if (phoneInput) {
        await browser.humanType(PUBLISH_SELECTORS.phoneInput, adData.phoneNumber);
        logs.push(createLog('Numéro de téléphone saisi'));
      }
    }
    
    // Afficher/masquer le téléphone
    if (!adData.showPhone) {
      const showPhoneToggle = await page.$(PUBLISH_SELECTORS.showPhoneToggle);
      if (showPhoneToggle) {
        const isChecked = await showPhoneToggle.isChecked();
        if (isChecked) {
          await showPhoneToggle.click();
          logs.push(createLog('Numéro de téléphone masqué'));
        }
      }
    }
    
  } catch (error) {
    logs.push(createLog(`⚠️ Erreur configuration téléphone: ${error}`));
  }
}

/**
 * Soumet l'annonce et vérifie le résultat
 */
async function submitAd(
  browser: LeboncoinBrowser,
  logs: string[]
): Promise<{ success: boolean; adUrl?: string; error?: string; errorType?: PublishErrorType }> {
  const page = browser.getPage();
  
  logs.push(createLog('Soumission de l\'annonce...'));
  
  try {
    // Capture avant soumission
    await browser.takeScreenshot('before_submit');
    
    // Vérifier la présence de CAPTCHA avant soumission
    const captcha = await page.$(PUBLISH_SELECTORS.captchaFrame);
    if (captcha) {
      logs.push(createLog('⚠️ CAPTCHA détecté avant soumission'));
      return {
        success: false,
        error: 'CAPTCHA détecté',
        errorType: 'captcha',
      };
    }
    
    // Trouver et cliquer sur le bouton de soumission
    const submitButton = await page.$(PUBLISH_SELECTORS.submitButton);
    const publishButton = await page.$(PUBLISH_SELECTORS.publishButton);
    const buttonToClick = submitButton || publishButton;
    
    if (!buttonToClick) {
      logs.push(createLog('❌ Bouton de soumission non trouvé'));
      return {
        success: false,
        error: 'Bouton de soumission non trouvé',
        errorType: 'form_validation',
      };
    }
    
    await browser.humanClick(buttonToClick === submitButton ? PUBLISH_SELECTORS.submitButton : PUBLISH_SELECTORS.publishButton);
    
    // Attendre le résultat
    await browser.randomDelay(3000, 5000);
    
    // Capture après soumission
    await browser.takeScreenshot('after_submit');
    
    // Vérifier le CAPTCHA après soumission
    const captchaAfter = await page.$(PUBLISH_SELECTORS.captchaFrame);
    if (captchaAfter) {
      logs.push(createLog('⚠️ CAPTCHA déclenché après soumission'));
      await browser.takeScreenshot('captcha_triggered');
      return {
        success: false,
        error: 'CAPTCHA déclenché',
        errorType: 'captcha',
      };
    }
    
    // Vérifier les erreurs
    const errorElement = await page.$(PUBLISH_SELECTORS.errorMessage);
    if (errorElement) {
      const errorText = await errorElement.textContent();
      logs.push(createLog(`❌ Erreur: ${errorText}`));
      
      // Analyser le type d'erreur
      const errorLower = (errorText || '').toLowerCase();
      let errorType: PublishErrorType = 'form_validation';
      
      if (errorLower.includes('limite') || errorLower.includes('limit')) {
        errorType = 'limit_reached';
      } else if (errorLower.includes('bloqué') || errorLower.includes('blocked')) {
        errorType = 'blocked';
      }
      
      return {
        success: false,
        error: errorText || 'Erreur de validation du formulaire',
        errorType,
      };
    }
    
    // Vérifier le message de limite
    const limitMessage = await page.$(PUBLISH_SELECTORS.limitMessage);
    if (limitMessage) {
      const limitText = await limitMessage.textContent();
      logs.push(createLog(`❌ Limite atteinte: ${limitText}`));
      return {
        success: false,
        error: limitText || 'Limite de publications atteinte',
        errorType: 'limit_reached',
      };
    }
    
    // Vérifier le succès
    try {
      await page.waitForSelector(PUBLISH_SELECTORS.successMessage, { timeout: 10000 });
      
      // Essayer de récupérer l'URL de l'annonce
      let adUrl: string | undefined;
      
      // L'URL est souvent dans la barre d'adresse après publication
      const currentUrl = page.url();
      if (currentUrl.includes('/offres/') || currentUrl.includes('/annonces/')) {
        adUrl = currentUrl;
      }
      
      // Ou chercher un lien vers l'annonce
      const adLink = await page.$('a[href*="/offres/"], a[href*="/annonces/"]');
      if (adLink) {
        const href = await adLink.getAttribute('href');
        if (href) {
          adUrl = href.startsWith('http') ? href : LEBONCOIN_URL + href;
        }
      }
      
      logs.push(createLog('✅ Annonce publiée avec succès!'));
      if (adUrl) {
        logs.push(createLog(`URL de l'annonce: ${adUrl}`));
      }
      
      await browser.takeScreenshot('success');
      
      return {
        success: true,
        adUrl,
      };
      
    } catch {
      // Pas de message de succès explicite, vérifier l'URL
      const currentUrl = page.url();
      
      if (currentUrl.includes('/offres/') || currentUrl.includes('/annonces/') || currentUrl.includes('/success')) {
        logs.push(createLog('✅ Annonce probablement publiée (redirection détectée)'));
        return {
          success: true,
          adUrl: currentUrl,
        };
      }
      
      logs.push(createLog('⚠️ Résultat incertain - vérifier manuellement'));
      await browser.takeScreenshot('uncertain_result');
      
      return {
        success: false,
        error: 'Résultat de publication incertain',
        errorType: 'unknown',
      };
    }
    
  } catch (error) {
    logs.push(createLog(`❌ Erreur lors de la soumission: ${error}`));
    await browser.takeScreenshot('submit_error');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: 'unknown',
    };
  }
}

/**
 * Publie une annonce sur Leboncoin
 * 
 * @param adData - Données de l'annonce à publier
 * @param credentials - Identifiants du compte Leboncoin
 * @param city - Ville de publication
 * @param options - Options de publication
 * @returns Résultat de la publication
 */
export async function publishAd(
  adData: AdData,
  credentials: AccountCredentials,
  city: City,
  session?: LeboncoinSession,
  options: PublishOptions = {}
): Promise<PublishResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  const screenshots: string[] = [];
  
  logs.push(createLog('=== DÉBUT DE LA PUBLICATION ==='));
  logs.push(createLog(`Annonce: ${adData.title}`));
  logs.push(createLog(`Catégorie: ${adData.categoryLabel}`));
  logs.push(createLog(`Ville: ${city.name} (${city.zipCode})`));
  
  // Configuration du navigateur
  const browserConfig = {
    headless: true,
    screenshotOnError: true,
    ...options.browserConfig,
  };
  
  let browser: LeboncoinBrowser | null = null;
  
  try {
    // 1. Initialiser le navigateur
    logs.push(createLog('Initialisation du navigateur...'));
    browser = await createBrowser(browserConfig);
    const page = browser.getPage();
    
    // 2. Authentification
    let currentSession = session;
    
    if (currentSession && options.useExistingSession !== false) {
      // Vérifier si la session existante est valide
      logs.push(createLog('Vérification de la session existante...'));
      const { valid, logs: checkLogs } = await checkSession(browser, currentSession);
      logs.push(...checkLogs);
      
      if (!valid) {
        logs.push(createLog('Session invalide, reconnexion nécessaire...'));
        currentSession = undefined;
      }
    }
    
    if (!currentSession) {
      // Se connecter
      logs.push(createLog('Connexion au compte Leboncoin...'));
      const authResult = await loginToLeboncoin(browser, credentials);
      logs.push(...authResult.logs);
      
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error,
          errorType: authResult.errorType as PublishErrorType,
          logs,
          city: city.name,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        };
      }
      
      currentSession = authResult.session;
    }
    
    // 3. Naviguer vers le formulaire de publication
    logs.push(createLog('Navigation vers le formulaire de publication...'));
    await page.goto(PUBLISH_URL, { waitUntil: 'domcontentloaded' });
    await browser.randomDelay(2000, 3000);
    
    // Accepter les cookies si nécessaire
    try {
      const cookieButton = await page.$(PUBLISH_SELECTORS.acceptCookies);
      if (cookieButton) {
        await cookieButton.click();
        await browser.randomDelay(500, 1000);
      }
    } catch {
      // Ignorer
    }
    
    // Capture de la page de publication
    const screenshotPath = await browser.takeScreenshot('publish_form');
    if (screenshotPath) screenshots.push(screenshotPath);
    
    // 4. Sélectionner la catégorie
    if (!await selectCategory(browser, adData.categoryLabel, logs)) {
      return {
        success: false,
        error: `Impossible de sélectionner la catégorie: ${adData.categoryLabel}`,
        errorType: 'form_validation',
        logs,
        screenshots,
        city: city.name,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
    
    await browser.randomDelay(1000, 2000);
    
    // 5. Remplir les champs principaux
    if (!await fillMainFields(browser, adData, logs)) {
      return {
        success: false,
        error: 'Erreur lors du remplissage des champs principaux',
        errorType: 'form_validation',
        logs,
        screenshots,
        city: city.name,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
    
    // 6. Remplir les champs dynamiques
    await fillDynamicFields(browser, adData, logs);
    
    // 7. Remplir la localisation
    if (!await fillLocation(browser, city, logs)) {
      return {
        success: false,
        error: `Erreur lors de la sélection de la ville: ${city.name}`,
        errorType: 'form_validation',
        logs,
        screenshots,
        city: city.name,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
    
    // 8. Upload des images
    await uploadImages(browser, adData.images, logs);
    
    // 9. Configurer les options de téléphone
    await configurePhone(browser, adData, logs);
    
    await browser.randomDelay(1000, 2000);
    
    // Capture avant soumission finale
    const preSubmitScreenshot = await browser.takeScreenshot('pre_submit_filled');
    if (preSubmitScreenshot) screenshots.push(preSubmitScreenshot);
    
    // 10. Soumettre l'annonce
    const submitResult = await submitAd(browser, logs);
    
    // Sauvegarder les logs du navigateur
    const browserLogs = browser.getLogs();
    logs.push(...browserLogs.map(l => `[Browser] ${l.message}`));
    
    // Prendre une capture finale
    const finalScreenshot = await browser.takeScreenshot('final_result');
    if (finalScreenshot) screenshots.push(finalScreenshot);
    
    logs.push(createLog('=== FIN DE LA PUBLICATION ==='));
    
    return {
      success: submitResult.success,
      adUrl: submitResult.adUrl,
      error: submitResult.error,
      errorType: submitResult.errorType,
      logs,
      screenshots,
      city: city.name,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
    
  } catch (error) {
    logs.push(createLog(`❌ Erreur inattendue: ${error instanceof Error ? error.message : String(error)}`));
    
    // Capture d'écran d'erreur
    if (browser) {
      const errorScreenshot = await browser.takeScreenshot('unexpected_error');
      if (errorScreenshot) screenshots.push(errorScreenshot);
    }
    
    // Déterminer le type d'erreur
    let errorType: PublishErrorType = 'unknown';
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('net::') || errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorType = 'network';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      logs,
      screenshots,
      city: city.name,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
    
  } finally {
    // Fermer le navigateur
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Publie une annonce avec retry automatique
 */
export async function publishAdWithRetry(
  adData: AdData,
  credentials: AccountCredentials,
  city: City,
  session?: LeboncoinSession,
  options: PublishOptions = {}
): Promise<PublishResult> {
  const retryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries: options.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries,
  };
  
  let lastResult: PublishResult | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    if (attempt > 0) {
      const isRetryable = lastResult?.errorType && 
        retryConfig.retryableErrors.includes(lastResult.errorType);
      
      if (!isRetryable) {
        break;
      }
      
      await exponentialBackoff(attempt, retryConfig);
    }
    
    lastResult = await publishAd(adData, credentials, city, session, options);
    
    if (lastResult.success) {
      return lastResult;
    }
    
    if (attempt < retryConfig.maxRetries) {
      lastResult.logs.push(createLog(`Tentative ${attempt + 1}/${retryConfig.maxRetries + 1} échouée, retry...`));
    }
  }
  
  return lastResult!;
}

export { PUBLISH_SELECTORS, PUBLISH_URL };
