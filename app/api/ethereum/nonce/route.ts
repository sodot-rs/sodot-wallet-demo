import { GoogleInfo, PasskeyInfo } from '@/app/types';
import { getUserFromCredentials, utilsDecodeCredentials } from '@/app/utils';
import { ETH_NET_URL } from '@/consts';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export interface getNonceRequestBody {
  address: string;
}

export interface getNonceResponseBody {
  nonce: number;
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  const authorizationHeader = req.headers.get('Authorization');
  let userInfo: GoogleInfo | PasskeyInfo;
  try {
    userInfo = utilsDecodeCredentials(authorizationHeader);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 401 });
  }

  const user = await getUserFromCredentials(userInfo);

  if (user === null) {
    return NextResponse.json({ message: 'User does not exist' }, { status: 401 });
  }
  const body: getNonceRequestBody = await req.json();
  const jsonRpcProvider = new ethers.JsonRpcProvider(ETH_NET_URL);

  const nonce = await jsonRpcProvider.getTransactionCount(body.address);
  const res: getNonceResponseBody = { nonce };
  return NextResponse.json(res, { status: 200 });
}
