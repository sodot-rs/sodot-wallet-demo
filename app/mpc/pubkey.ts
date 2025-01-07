import { DERIVATION_PATH, RELAY_URL } from '@/consts';
import { Ecdsa, EcdsaKeygenResult, EcdsaPublicKey } from '@sodot/sodot-web-sdk-demo';

export default async function getPubkey(
  keygenResult: EcdsaKeygenResult,
): Promise<Promise<EcdsaPublicKey>> {
  const ecdsa = new Ecdsa(RELAY_URL);
  const derivationPathUint = new Uint32Array(DERIVATION_PATH);
  return await ecdsa.derivePubkey(keygenResult, derivationPathUint);
}
