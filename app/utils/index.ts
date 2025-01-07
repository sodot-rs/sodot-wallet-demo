import { GoogleInfo, PasskeyInfo, isGoogleInfo } from '@/app/types';
import { JWT_SECRET_KEY } from '@/consts';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const prisma = new PrismaClient();

export function utilsDecodeCredentials(
  credential: string | undefined | null,
): GoogleInfo | PasskeyInfo {
  if (!credential) {
    throw new Error('No credential provided');
  }

  return jwt.verify(credential, JWT_SECRET_KEY) as GoogleInfo | PasskeyInfo;
}

export function utilsCreateCredentials(userInfo: GoogleInfo | PasskeyInfo): string {
  return jwt.sign(userInfo, JWT_SECRET_KEY);
}

export async function getUserFromCredentials(userInfo: GoogleInfo | PasskeyInfo) {
  const promise = isGoogleInfo(userInfo)
    ? prisma.user.findUnique({
        where: {
          email: userInfo.email,
        },
      })
    : prisma.passkeyUser.findUnique({
        where: {
          id: userInfo.id,
        },
      });
  return promise;
}
