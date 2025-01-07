'use client';

import { getEncryptedShares, postEncryptedShares } from '@/app/fetch';
import { EcdsaKeygenResult } from '@sodot/sodot-web-sdk-demo';

import { userGetEncryptionKey, userIsPasskeyUser } from '../user';

const BACKUP_FILENAME = 'keyBackUpSecret.json';

// Encrypt a plaintext string with a given key
async function encrypt(plaintext: string, key: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Import the key for encryption
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, [
    'encrypt',
  ]);

  // Generate a random initialization vector (IV)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    cryptoKey,
    data,
  );

  // Combine IV and encrypted data into a single buffer and encode as Base64
  const combinedBuffer = new Uint8Array(iv.length + encryptedData.byteLength);
  combinedBuffer.set(iv);
  combinedBuffer.set(new Uint8Array(encryptedData), iv.length);

  return btoa(String.fromCharCode(...combinedBuffer));
}

// Decrypt a ciphertext string with a given key
async function decrypt(ciphertext: string, key: Uint8Array): Promise<string> {
  const decoder = new TextDecoder();

  // Decode the Base64 ciphertext
  const encryptedBuffer = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

  // Extract the IV and encrypted data
  const iv = encryptedBuffer.slice(0, 12);
  const encryptedData = encryptedBuffer.slice(12);

  // Import the key for decryption
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-GCM' }, false, [
    'decrypt',
  ]);

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    cryptoKey,
    encryptedData,
  );

  return decoder.decode(decryptedData);
}

export async function storeKeygenResultInBackup(data: EcdsaKeygenResult): Promise<void> {
  if (userIsPasskeyUser()) {
    const key = userGetEncryptionKey();
    if (!key) {
      //should not happen
      throw new Error('Encryption key not found');
    }
    const encrypted = await encrypt(JSON.stringify(data), key);
    await postEncryptedShares(encrypted);
    return;
  } else {
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('Access token not found');
    }
    await createFileWithFetch(accessToken, BACKUP_FILENAME, data);
  }
}

async function getKeygenResultFromBackupPasskey(): Promise<EcdsaKeygenResult | null> {
  const res = await getEncryptedShares();
  if (!res) {
    return null;
  }

  const key = userGetEncryptionKey();
  if (!key) {
    //should not happen
    throw new Error('Encryption key not found');
  }
  //decrypting res, parsing as json
  const decrypted = await decrypt(res, key);

  return JSON.parse(decrypted) as EcdsaKeygenResult;
}

export async function getKeygenResultFromBackup(
  isPasskeyUser = false,
): Promise<EcdsaKeygenResult | null> {
  if (typeof window === 'undefined') {
    return null; // Server-side: no sessionStorage
  }

  if (isPasskeyUser) {
    return await getKeygenResultFromBackupPasskey();
    // Passkey users don't need backup
  }
  const accessToken = sessionStorage.getItem('accessToken');

  if (!accessToken) {
    throw new Error('Access token not found');
  }

  const data = await getBackupFile(accessToken, BACKUP_FILENAME);
  if (!data) {
    return null; // No backup file found
  }

  return data;
}

async function createFileWithFetch(
  accessToken: string,
  fileName: string,
  jsonData: EcdsaKeygenResult,
) {
  const metadata = {
    name: fileName, // Set the name of the file (e.g., 'backup.json')
    mimeType: 'application/json', // MIME type for the JSON file
    parents: ['appDataFolder'], // Store in the App Data folder
  };

  const form = new FormData();

  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

  form.append('file', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`, // Bearer token here
      },
      body: form, // Include FormData with metadata and file content
    },
  );

  if (!response.ok) {
    throw new Error('Error uploading file');
  }

  const result = await response.json();
  return result; // Return file metadata, including file ID
}

export async function getBackupFile(
  accessToken: string,
  name: string,
): Promise<EcdsaKeygenResult | null> {
  // Step 1: List all files inside `appDataFolder` with the specified backup filename
  const resp = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name='${name}'`,
    )}&spaces=appDataFolder&orderBy=createdTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Use the provided access token
      },
    },
  );

  const data = await resp.json();

  // If no files found, return null
  if (!data.files || data.files.length === 0) {
    return null;
  }

  // Step 2: Get the most recent file based on created time
  const fileMetadata = data.files[0];

  // Fetch the file data using the file ID
  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileMetadata.id}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Use the provided access token
      },
    },
  );

  // Read the file's raw data
  const fileRawData = await fileRes.text();

  // If the file is empty, return null
  if (fileRawData.length === 0) {
    return null;
  }

  // Step 3: Parse the raw file data as JSON
  try {
    const backupData: EcdsaKeygenResult = JSON.parse(fileRawData);
    return backupData; // Return the parsed backup data
  } catch {
    // If the JSON is invalid, return null
    return null;
  }
}
