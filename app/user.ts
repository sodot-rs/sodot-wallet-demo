import { getKeygenResultFromBackup } from '@/app/keyBackup/keyBackup';
import { EcdsaKeygenResult, EcdsaPublicKey } from '@sodot/sodot-web-sdk-demo';

import getPubkey from './mpc/pubkey';
import { base64url } from './passkey';

export async function userInit(credential: string | undefined, accessToken: string): Promise<void> {
  sessionStorage.setItem('accessToken', JSON.stringify(accessToken));
  sessionStorage.setItem('credentials', JSON.stringify(credential));
  const keygenResult = await getKeygenResultFromBackup();
  sessionStorage.setItem('keygenResult', JSON.stringify(keygenResult));
}

export async function userInitPasskey(userHandle: string, credential: string): Promise<void> {
  sessionStorage.setItem('credentials', JSON.stringify(credential));
  sessionStorage.setItem('encryptionKey', userHandle);
  const keygenResult = await getKeygenResultFromBackup(true);
  sessionStorage.setItem('keygenResult', JSON.stringify(keygenResult));
}

export function userClear(): void {
  sessionStorage.removeItem('credentials');
  sessionStorage.removeItem('keygenResult');
  sessionStorage.removeItem('pubkey');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('encryptionKey');
}

export function userGetEncryptionKey(): Uint8Array | undefined {
  const encryptionKey = sessionStorage.getItem('encryptionKey');
  if (!encryptionKey) {
    return undefined;
  }
  return base64url.decode(encryptionKey) as unknown as Uint8Array;
}

export function userIsPasskeyUser(): boolean {
  return !!sessionStorage.getItem('encryptionKey');
}

export function userGetAccessToken(): string | undefined {
  const accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    return undefined;
  }
  return JSON.parse(accessToken) as string;
}

export function userGetKeygenResult(): EcdsaKeygenResult | null {
  const creds = sessionStorage.getItem('keygenResult');
  if (!creds) {
    return null;
  }
  return JSON.parse(creds) as EcdsaKeygenResult;
}

export async function userGetPubkey(): Promise<EcdsaPublicKey | null> {
  const keygenResult = userGetKeygenResult();
  const pubkey = !keygenResult ? null : await getPubkey(keygenResult);
  return pubkey;
}

export function userGetCredentials(): string | undefined {
  const creds = sessionStorage.getItem('credentials');
  if (!creds) {
    return undefined;
  }
  return JSON.parse(creds) as string;
}

export function userSetKeygenResult(keygenResult: EcdsaKeygenResult): void {
  sessionStorage.setItem('keygenResult', JSON.stringify(keygenResult));
}
