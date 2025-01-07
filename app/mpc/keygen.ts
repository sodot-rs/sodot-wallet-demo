import { clientRequestCreateRoom, clientRequestKeyInit, clientRequestKeygen } from '@/app/fetch';
import { storeKeygenResultInBackup } from '@/app/keyBackup/keyBackup';
import { N, RELAY_URL, T } from '@/consts';
import { Ecdsa, EcdsaKeygenResult } from '@sodot/sodot-web-sdk-demo';

export default async function generateKeys(): Promise<EcdsaKeygenResult> {
  const ecdsa = new Ecdsa(RELAY_URL);
  const initKeygenClient1Result = await ecdsa.initKeygen();

  const keygenRoomUuid = await clientRequestCreateRoom(N);
  const serverKeygenId = await clientRequestKeyInit();

  const [, keygenClientResult] = await Promise.all([
    clientRequestKeygen(keygenRoomUuid, N, T, [initKeygenClient1Result.keygenId]),
    ecdsa.keygen(keygenRoomUuid, N, T, initKeygenClient1Result, [serverKeygenId]),
  ]);
  await storeKeygenResultInBackup(keygenClientResult);
  return keygenClientResult;
}
