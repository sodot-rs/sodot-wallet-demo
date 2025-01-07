import { PasskeyInfo } from '@/app/types';
import { prisma, utilsDecodeCredentials } from '@/app/utils';
import { NextRequest, NextResponse } from 'next/server';

export interface GetEncryptedSharesResponseBody {
  data: string;
}
export async function GET(req: NextRequest): Promise<NextResponse> {
  const authorizationHeader = req.headers.get('Authorization');
  const creds = utilsDecodeCredentials(authorizationHeader) as PasskeyInfo;
  const passkeyUser = await prisma.passkeyUser.findUnique({
    where: { id: creds.id },
  });

  if (!passkeyUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    {
      data: passkeyUser.encryptedShares,
    },
    { status: 200 },
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { encryptedShares } = await req.json();
  const authorizationHeader = req.headers.get('Authorization');
  const creds = utilsDecodeCredentials(authorizationHeader) as PasskeyInfo;
  const passkeyUser = await prisma.passkeyUser.findUnique({
    where: { id: creds.id },
  });
  if (!passkeyUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  passkeyUser.encryptedShares = encryptedShares;
  await prisma.passkeyUser.update({
    where: { id: creds.id },
    data: passkeyUser,
  });

  if (!passkeyUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ message: 'success' }, { status: 200 });
}
