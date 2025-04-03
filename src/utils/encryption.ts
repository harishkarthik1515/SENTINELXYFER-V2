import CryptoJS from 'crypto-js';

export const generateEncryptionKey = () => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

export const encryptData = (data: string, key: string) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decryptData = (encryptedData: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const splitIntoChunks = (data: string, chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

export const reassembleChunks = (chunks: string[]) => {
  return chunks.join('');
};