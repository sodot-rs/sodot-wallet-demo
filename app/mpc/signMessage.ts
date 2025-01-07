import { clientRequestCreateRoom, clientRequestSignMessage } from '@/app/fetch';
import { userGetKeygenResult, userGetPubkey } from '@/app/user';
import { DERIVATION_PATH, N, RELAY_URL } from '@/consts';
import { Ecdsa, EcdsaSignature, MessageHash } from '@sodot/sodot-web-sdk-demo';
import elliptic from 'elliptic';

const ec: elliptic.ec = new elliptic.ec('secp256k1');

export default async function signMessage(message: string): Promise<EcdsaSignature> {
  const ecdsa = new Ecdsa(RELAY_URL);
  const signRoomUuid = await clientRequestCreateRoom(N);
  const messageHash = new MessageHash(message.slice(2));

  const promises = [];
  promises.push(clientRequestSignMessage(messageHash, signRoomUuid, DERIVATION_PATH));
  const keygenResult = userGetKeygenResult();
  if (keygenResult === null) {
    throw new Error('No keygen result found');
  }
  promises.push(
    ecdsa.sign(signRoomUuid, keygenResult, messageHash, new Uint32Array(DERIVATION_PATH)),
  );

  const res = (await Promise.all(promises)) as EcdsaSignature[];
  const sig = res[1]; //this holds the ecdsa.sign result

  const pubkey = await userGetPubkey();
  if (pubkey === null) {
    //not supposed to happen
    throw new Error('No pubkey found');
  }

  const uncompressed = pubkey.serializeUncompressed();
  const signDer = Buffer.from(sig.der).toString('hex');
  const key = ec.keyFromPublic(uncompressed, 'hex');
  if (!key.verify(messageHash.bytes, signDer)) {
    throw new Error('Signature verification failed');
  }

  return sig;
}
