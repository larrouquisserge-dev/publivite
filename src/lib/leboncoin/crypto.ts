/**
 * Utilitaires de chiffrement pour les identifiants Leboncoin
 * 
 * Utilise AES-256-GCM pour chiffrer les mots de passe et données sensibles
 * stockés en base de données.
 */

import * as crypto from 'crypto';

// Algorithme de chiffrement
const ALGORITHM = 'aes-256-gcm';

// Taille de l'IV (Initialization Vector) pour AES-GCM
const IV_LENGTH = 16;

// Taille du tag d'authentification pour GCM
const AUTH_TAG_LENGTH = 16;

// Clé de chiffrement (doit être définie dans les variables d'environnement)
// En production, utilisez une clé générée de manière sécurisée et stockée dans un gestionnaire de secrets
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  
  if (!key) {
    console.warn('[Crypto] ENCRYPTION_KEY non définie, utilisation d\'une clé par défaut (NON SÉCURISÉ en production)');
    // Clé par défaut pour le développement uniquement
    return crypto.scryptSync('default-dev-key-change-in-production', 'salt', 32);
  }
  
  // Dériver une clé de 32 bytes à partir de la clé fournie
  return crypto.scryptSync(key, 'leboncoin-salt', 32);
};

/**
 * Chiffre une chaîne de caractères
 * @param plaintext - Texte à chiffrer
 * @returns Texte chiffré en base64 (format: iv:authTag:encrypted)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    return '';
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, auth tag et texte chiffré
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Déchiffre une chaîne de caractères
 * @param encryptedText - Texte chiffré (format: iv:authTag:encrypted)
 * @returns Texte déchiffré
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    return '';
  }

  const key = getEncryptionKey();
  
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Format de texte chiffré invalide');
  }
  
  const [ivBase64, authTagBase64, encrypted] = parts;
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Vérifie si un texte est chiffré (format valide)
 * @param text - Texte à vérifier
 * @returns true si le texte semble être chiffré
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  
  const parts = text.split(':');
  if (parts.length !== 3) return false;
  
  // Vérifier que chaque partie est du base64 valide
  try {
    for (const part of parts) {
      Buffer.from(part, 'base64');
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Génère une clé de chiffrement aléatoire
 * À utiliser pour générer ENCRYPTION_KEY
 * @returns Clé de 64 caractères hexadécimaux
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hache un mot de passe pour comparaison (non réversible)
 * Utile pour vérifier rapidement si un mot de passe a changé
 * @param password - Mot de passe à hacher
 * @returns Hash du mot de passe
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Chiffre un objet JSON
 * @param data - Objet à chiffrer
 * @returns Texte chiffré en base64
 */
export function encryptJSON<T extends object>(data: T): string {
  return encrypt(JSON.stringify(data));
}

/**
 * Déchiffre un objet JSON
 * @param encryptedText - Texte chiffré
 * @returns Objet déchiffré
 */
export function decryptJSON<T extends object>(encryptedText: string): T {
  const decrypted = decrypt(encryptedText);
  return JSON.parse(decrypted) as T;
}

/**
 * Masque un email pour l'affichage (ex: j***@gmail.com)
 * @param email - Email à masquer
 * @returns Email masqué
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***';
  
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.length > 2 
    ? localPart[0] + '***' + localPart[localPart.length - 1]
    : '***';
  
  return `${maskedLocal}@${domain}`;
}

/**
 * Masque un mot de passe pour les logs (toujours retourne ***)
 * @returns Mot de passe masqué
 */
export function maskPassword(): string {
  return '***';
}
