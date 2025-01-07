import { EcdsaPublicKey } from '@sodot/sodot-web-sdk-demo';
import { Transaction, ethers, getBigInt, hexlify, keccak256, parseEther } from 'ethers';

import { clientBroadcastTransaction, clientGetBalance, clientGetNonce } from '../fetch';
import signMessage from '../mpc/signMessage';

export function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
// Generate Ethereum address from ECDSA public key
export function addressFromPublicKey(publicKey: EcdsaPublicKey): string {
  // Get the uncompressed public key without the first byte
  const uncompressedNoFirstByte = publicKey.serializeUncompressed().slice(1);

  // Convert the public key to a hex string
  const uncompressedNoFirstByteHex = uint8ArrayToHex(uncompressedNoFirstByte);

  // Perform keccak256 hashing of the public key
  const publicKeyHash = keccak256('0x' + uncompressedNoFirstByteHex);

  // Take the last 20 bytes (40 hex characters) to generate the Ethereum address
  const address = '0x' + publicKeyHash.slice(26);

  return address;
}

export async function getBalance(address: string): Promise<string> {
  return await clientGetBalance(address);
}

export function validateAddress(address: string): boolean {
  // Check if the address starts with "0x" and has a valid length of 42 characters
  if (!address.startsWith('0x') || address.length !== 42) {
    return false;
  }

  // Check if all characters after "0x" are valid hexadecimal characters
  const hexPattern = /^[0-9a-fA-F]{40}$/;
  return hexPattern.test(address.slice(2)); // Skip "0x" prefix
}

export async function createSignedTransaction(
  amount: number,
  receiveAddress: string,
  pubkey: EcdsaPublicKey | null,
): Promise<string> {
  //some basic checks
  if (amount <= 0) {
    throw new Error('Amount must more than 0');
  }

  if (!pubkey) {
    throw new Error('No public key found');
  }

  const sendAddress = addressFromPublicKey(pubkey);

  if (!validateAddress(receiveAddress)) {
    throw new Error('Invalid address');
  }

  if (receiveAddress === sendAddress) {
    throw new Error('Cannot send to yourself');
  }

  //build the transaction
  const nonce = await clientGetNonce(sendAddress);
  const transactionRequest = {
    to: receiveAddress,
    value: parseEther(amount.toString()),
    nonce: nonce,
    chainId: getBigInt(11155111),
    type: 2,
  };
  const txRequest: ethers.TransactionLike<string> = {
    ...transactionRequest,
    nonce: nonce,
    gasLimit: getBigInt(21000),
    chainId: getBigInt(11155111),
    maxFeePerGas: getBigInt(34599716012),
    maxPriorityFeePerGas: getBigInt(25302576),
    type: 2,
  };

  //sign the transaction
  const txSerialized = Transaction.from(txRequest).unsignedSerialized;

  const sig = await signMessage(keccak256(txSerialized));

  const signedTx = Transaction.from({
    ...txRequest,
    signature: {
      r: hexlify(sig.r), // Add r, v, and s from the signature
      v: sig.v,
      s: hexlify(sig.s),
    },
  });

  //server broadcast
  await clientBroadcastTransaction(signedTx.serialized);
  return signedTx.hash || '';
}
