import CryptoJS from 'crypto-js';

/**
 * Sistema de armazenamento seguro com criptografia
 * Substitui o localStorage padrão para dados sensíveis
 */

// Chave de criptografia derivada (em produção, usar uma chave mais robusta)
const getEncryptionKey = (): string => {
  // Em produção, esta chave deve vir de variáveis de ambiente seguras
  const key = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key-change-in-prod';
  return CryptoJS.SHA256(key + window.location.origin).toString();
};

/**
 * Criptografa dados antes de armazenar
 */
const encrypt = (data: string): string => {
  try {
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (error) {
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
  } catch (error) {
    console.error('Decryption failed');
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
        return decrypt(encryptedData.substring(10));
      }
      
      // Dados legados não criptografados (migração)
      return encryptedData;
    } catch (error) {
      console.error('Failed to retrieve secure data');
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      const encryptedData = 'encrypted:' + encrypt(value);
      localStorage.setItem(key, encryptedData);
    } catch (error) {
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