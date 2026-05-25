// lib/crypto.ts
import CryptoJS from 'crypto-js';

// Locks the text before sending to Supabase
export const encryptMessage = (text: string, secretKey: string) => {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

// Unlocks the text when downloading from Supabase
export const decryptMessage = (ciphertext: string, secretKey: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || "🔒 [Unreadable Message]";
  } catch (e) {
    return "🔒 [Encrypted Message]";
  }
};