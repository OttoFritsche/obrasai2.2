import CryptoJS from 'crypto-js';

/**
 * Sistema de armazenamento seguro com criptografia
 * Substitui o localStorage padrão para dados sensíveis
 */

// Chave de criptografia derivada de forma segura
const getEncryptionKey = (): string => {
  // Verificar se a chave de ambiente está definida
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY;
  
  if (!envKey) {
    if (import.meta.env.DEV) {
      console.warn('VITE_ENCRYPTION_KEY não está definida. Usando chave padrão para desenvolvimento.');
      // Chave padrão apenas para desenvolvimento
      return 'dev-key-not-for-production-use-only-32chars';
    }
    throw new Error('VITE_ENCRYPTION_KEY não está definida. Configure uma chave de criptografia segura.');
  }
  
  // Validar comprimento mínimo da chave
  if (envKey.length < 32) {
    if (import.meta.env.DEV) {
      console.warn('VITE_ENCRYPTION_KEY deve ter pelo menos 32 caracteres. Usando chave padrão para desenvolvimento.');
      return 'dev-key-not-for-production-use-only-32chars';
    }
    throw new Error('VITE_ENCRYPTION_KEY deve ter pelo menos 32 caracteres.');
  }
  
  // Derivar chave usando PBKDF2 para maior segurança
  const salt = CryptoJS.SHA256(window.location.origin).toString();
  const key = CryptoJS.PBKDF2(envKey, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  
  return key.toString();
};

/**
 * Criptografa dados antes de armazenar
 */
const encrypt = (data: string): string => {
  try {
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (_error) {
    console.error('Encryption failed');
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Descriptografa dados ao recuperar
 */
const decrypt = (encryptedData: string): string => {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Invalid encrypted data');
    }
    
    return decrypted;
  } catch (_error) {
    // Log mais silencioso para evitar spam no console
    if (import.meta.env.DEV) {
      console.warn('Decryption failed - data may be corrupted or from different key');
    }
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Implementação de storage seguro compatível com Supabase
 */
export const createSecureStorage = () => ({
  getItem: (key: string): string | null => {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;
      
      // Verificar se os dados já estão criptografados
      if (encryptedData.startsWith('encrypted:')) {
        try {
          return decrypt(encryptedData.substring(10));
        } catch (decryptError) {
          // Dados corrompidos ou chave diferente - limpar e retornar null
          if (import.meta.env.DEV) {
            console.warn(`Removing corrupted encrypted data for key: ${key}`);
          }
          localStorage.removeItem(key);
          return null;
        }
      }
      
      // Dados legados não criptografados (migração)
      return encryptedData;
    } catch (_error) {
      console.error('Failed to retrieve secure data');
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      const encryptedData = 'encrypted:' + encrypt(value);
      localStorage.setItem(key, encryptedData);
    } catch (_error) {
      console.error('Failed to store secure data');
      // Fallback para armazenamento não criptografado em desenvolvimento
      if (import.meta.env.DEV) {
        localStorage.setItem(key, value);
      }
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
});

/**
 * Utilitários para criptografia de dados gerais
 */
export const encryptData = (data: string): string => {
  return encrypt(data);
};

export const decryptData = (encryptedData: string): string => {
  return decrypt(encryptedData);
};