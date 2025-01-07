import { getUserFromCredentials, utilsDecodeCredentials } from '@/app/utils';
import { VERTEX_API_KEY, VERTEX_URL } from '@/consts';
import { NextRequest, NextResponse } from 'next/server';

export interface CreateRoomRequestbody {
  N: string;
}

export interface CreateRoomResponseBody {
  room_uuid: string;
}
export async function POST(req: NextRequest): Promise<NextResponse> {
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
  const body: CreateRoomRequestbody = await req.json();

  const res = await fetch(`${VERTEX_URL}/create-room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: VERTEX_API_KEY,
      Accept: 'application/json',
    },
    body: JSON.stringify({ room_size: Number(body.N) }),
  });

  const data = await res.json();
  const response: CreateRoomResponseBody = { room_uuid: data.room_uuid };
  return NextResponse.json(response, { status: 200 });
}
