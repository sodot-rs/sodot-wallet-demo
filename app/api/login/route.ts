import { prisma, utilsCreateCredentials } from '@/app/utils';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export interface LoginResponseBody {
  token: string;
}

export interface LoginRequestBody {
  accessToken: string;
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  const reqBody: LoginRequestBody = await req.json();
  const accessToken: string = reqBody.accessToken;
  // let googleInfo: googleInfo;
  const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let user;
  try {
    user = await prisma.user.findUnique({
      where: {
        email: userInfo.data.email,
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'DB does not exist. Please run "npm run db::init" to initialize it.' },
      { status: 500 },
    );
  }

  if (user === null) {
    //creating new user if not found
    user = await prisma.user.create({
      data: {
        email: userInfo.data.email,
        keyId: '',
      },
    });
  }

  const cred = utilsCreateCredentials(userInfo.data);
  const resBody: LoginResponseBody = { token: cred };
  return NextResponse.json(resBody, { status: 200 });
}
