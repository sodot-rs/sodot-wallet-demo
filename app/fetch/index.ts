import { MessageHash } from '@sodot/sodot-web-sdk-demo';

import { CreateRoomResponseBody } from '../api/createRoom/route';
import { GetBalanceRequestBody, GetBalanceResponseBody } from '../api/ethereum/balance/route';
import { BroadcastTransactionRequestBody } from '../api/ethereum/broadcastTransaction/route';
import { getNonceRequestBody, getNonceResponseBody } from '../api/ethereum/nonce/route';
import { BodyKeygenRespone } from '../api/keyInit/route';
import { LoginResponseBody } from '../api/login/route';
import { GetEncryptedSharesResponseBody } from '../api/passkey/encryptedShares/route';
import { SignMessageRequestBody } from '../api/signMessage/route';
import { userGetCredentials } from '../user';
import { Fetcher } from './fetch';

export async function clientRequestKeygen(
  keygenRoomUuid: string,
  N: number,
  T: number,
  clientKeygenIds: string[],
): Promise<void> {
  const fetcher = new Fetcher<BodyKeygenRespone>('/api/keygen');
  await fetcher.post({
    keygenRoomUuid,
    N,
    T,
    clientKeygenIds,
  });
}

export async function clientRequestKeyInit(): Promise<string> {
  const fetcher = new Fetcher<BodyKeygenRespone>('/api/keyInit');
  const res = await fetcher.post();
  return res.keygenId;
}

export async function login(accessToken: string): Promise<string> {
  const fetcher = new Fetcher<LoginResponseBody>('/api/login', false);
  const res = await fetcher.post({ accessToken });
  return res.token;
}

export async function getEncryptedShares(): Promise<string | null> {
  const fetcher = new Fetcher<GetEncryptedSharesResponseBody>('/api/passkey/encryptedShares');
  const res = await fetcher.get();
  const data = res.data;
  if (data === 'null') {
    return null;
  }
  return res.data;
}

export async function postEncryptedShares(encryptedShares: string): Promise<void> {
  const fetcher = new Fetcher<void>('api/passkey/encryptedShares');
  await fetcher.post({ encryptedShares });
}

export async function clientRequestSignMessage(
  messageHash: MessageHash,
  roomUuid: string,
  derivationPath: number[],
): Promise<void> {
  const creds = userGetCredentials();
  if (!creds) {
    throw new Error('no credentials found'); //should never happen
  }
  const messageEncoded = messageHash.toHex();
  const reqBody: SignMessageRequestBody = {
    room_uuid: roomUuid,
    msg: messageEncoded,
    derivation_path: derivationPath,
    extra_data: '',
    hash_algo: 'none',
  };
  const fetcher = new Fetcher<void>('/api/signMessage');
  await fetcher.post(reqBody as unknown as Record<string, unknown>);
}

export async function clientGetNonce(address: string): Promise<number> {
  const body: getNonceRequestBody = {
    address,
  };
  const fetcher = new Fetcher<getNonceResponseBody>('/api/ethereum/nonce');
  const res = await fetcher.post(body as unknown as Record<string, unknown>);
  return res.nonce;
}

export async function clientGetBalance(address: string): Promise<string> {
  const body: GetBalanceRequestBody = { address };
  const fetcher = new Fetcher<GetBalanceResponseBody>('/api/ethereum/balance');

  const res = await fetcher.post(body as unknown as Record<string, unknown>);
  return res.balance;
}

export async function clientBroadcastTransaction(transactionSerialized: string): Promise<void> {
  const body: BroadcastTransactionRequestBody = { transactionSerialized };
  const fetcher = new Fetcher('/api/ethereum/broadcastTransaction');
  await fetcher.post(body as unknown as Record<string, unknown>);
}

export async function clientRegisterAiAgent(payload: string, url: string): Promise<void> {
  const fetcher = new Fetcher('/api/aiAgent/register');
  await fetcher.post({ payload, url });
}

export async function clientRequestCreateRoom(N: number): Promise<string> {
  const fetcher = new Fetcher<CreateRoomResponseBody>('/api/createRoom');
  const res = await fetcher.post({ N: N.toString() });
  return res.room_uuid;
}
