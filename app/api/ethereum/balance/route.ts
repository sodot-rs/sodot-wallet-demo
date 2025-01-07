import { getUserFromCredentials, utilsDecodeCredentials } from '@/app/utils';
import { ETH_NET_URL } from '@/consts';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export interface GetBalanceRequestBody {
  address: string;
}

export interface GetBalanceResponseBody {
  balance: string;
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
  const body: GetBalanceRequestBody = await req.json();

  const jsonRpcProvider = new ethers.JsonRpcProvider(ETH_NET_URL);
  const balanceWei = await jsonRpcProvider.getBalance(body.address);
  const balanceEther = ethers.formatEther(balanceWei);
  const res: GetBalanceResponseBody = { balance: balanceEther };
  return NextResponse.json(res, { status: 200 });
}
