import { GoogleInfo, PasskeyInfo, isPasskeyInfo } from '@/app/types';
import { prisma, utilsDecodeCredentials } from '@/app/utils';
import { VERTEX_API_KEY, VERTEX_URL } from '@/consts';
import { NextRequest, NextResponse } from 'next/server';

export interface BodyKeygenRespone {
  message: string;
  keygenId: string;
}

export interface VertexKeyInfo {
  key_id: string;
  keygen_id: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  //get authorization token
  const authorizationHeader = req.headers.get('Authorization');
  let userInfo: PasskeyInfo | GoogleInfo;
  try {
    userInfo = utilsDecodeCredentials(authorizationHeader);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const createKeyinfoRes = await fetch(`${VERTEX_URL}/ecdsa/create`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: VERTEX_API_KEY,
      Accept: 'application/json',
    },
  });
  const serverkeyInfo: VertexKeyInfo = await createKeyinfoRes.json();
  //will store the initKeyGenResult from the vertex if the request is successful
  const responseBody: BodyKeygenRespone = {
    message: 'key gen successful',
    keygenId: serverkeyInfo.keygen_id,
  };

  if (isPasskeyInfo(userInfo)) {
    const passkeyInfo = userInfo;
    const user = await prisma.passkeyUser.findUnique({
      where: {
        id: passkeyInfo.id,
      },
    });

    if (user === null) {
      return NextResponse.json({ message: 'User does not exist' }, { status: 401 });
    }

    await prisma.passkeyUser.update({
      where: {
        id: passkeyInfo.id,
      },
      data: {
        keyId: serverkeyInfo.key_id,
      },
    });
  } else {
    const googleInfo = userInfo;
    const user = await prisma.user.findUnique({
      where: {
        email: googleInfo.email,
      },
    });

    if (user === null) {
      return NextResponse.json({ message: 'User does not exist' }, { status: 401 });
    }
    await prisma.user.update({
      where: {
        email: googleInfo.email,
      },
      data: {
        keyId: serverkeyInfo.key_id,
      },
    });
  }

  return NextResponse.json(responseBody, { status: 200 });
}
