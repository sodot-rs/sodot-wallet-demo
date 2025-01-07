import { GoogleInfo, PasskeyInfo, isPasskeyInfo } from '@/app/types';
import { prisma, utilsDecodeCredentials } from '@/app/utils';
import { VERTEX_API_KEY, VERTEX_URL } from '@/consts';
import { NextRequest, NextResponse } from 'next/server';

export interface SignMessageRequestBody {
  msg: string;
  derivation_path: number[];
  extra_data: string;
  hash_algo: string;
  room_uuid: string;
}

export interface SignMessageResponseBody {
  message: string; // success or failure
  signedMessage: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authorizationHeader = req.headers.get('Authorization');
  let userInfo: GoogleInfo | PasskeyInfo;
  try {
    userInfo = utilsDecodeCredentials(authorizationHeader);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  let user: { keyId: string } | null;
  if (isPasskeyInfo(userInfo)) {
    user = await prisma.passkeyUser.findUnique({
      where: {
        id: userInfo.id,
      },
    });
  } else {
    user = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }

  if (user === null) {
    return NextResponse.json({ message: 'User does not exist' }, { status: 401 });
  }

  const keyId = user.keyId;
  const reqBody: SignMessageRequestBody = await req.json();
  const vertexPayload: SignMessageRequestBody & { key_id: string } = {
    ...reqBody,
    key_id: keyId,
  };

  await fetch(`${VERTEX_URL}/ecdsa/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: VERTEX_API_KEY,
      Accept: 'application/json',
    },
    body: JSON.stringify(vertexPayload),
  });

  const resBody: SignMessageResponseBody = {
    message: 'success',
    signedMessage: 'signed message ' + reqBody.msg,
  };

  return NextResponse.json(resBody, { status: 200 });
}
