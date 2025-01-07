import { getUserFromCredentials, utilsDecodeCredentials } from '@/app/utils';
import { VERTEX_API_KEY, VERTEX_URL } from '@/consts';
import { NextRequest, NextResponse } from 'next/server';

interface KeygenRequestBody {
  keygenRoomUuid: string;
  N: number;
  T: number;
  clientKeygenIds: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const keyGenRequestBody = (await req.json()) as KeygenRequestBody;

  const authorizationHeader = req.headers.get('Authorization');
  let userInfo;
  try {
    userInfo = utilsDecodeCredentials(authorizationHeader);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const user = await getUserFromCredentials(userInfo);

  if (user === null) {
    return NextResponse.json({ message: 'User does not exist' }, { status: 401 });
  }

  const vertexRequestPayload = {
    room_uuid: keyGenRequestBody.keygenRoomUuid,
    key_id: user.keyId,
    num_parties: keyGenRequestBody.N,
    threshold: keyGenRequestBody.T,
    others_keygen_ids: keyGenRequestBody.clientKeygenIds,
  };

  const res = await fetch(`${VERTEX_URL}/ecdsa/keygen`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: VERTEX_API_KEY,
      Accept: 'application/json',
    },
    body: JSON.stringify(vertexRequestPayload),
  });
  if (!res.ok) {
    throw new Error('error in keygen');
  }

  return NextResponse.json({ message: 'key gen success' }, { status: 200 });
}
