import { getUserFromCredentials, utilsDecodeCredentials } from '@/app/utils';
import { ETH_NET_URL } from '@/consts';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export interface BroadcastTransactionRequestBody {
  transactionSerialized: string;
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
  const body: BroadcastTransactionRequestBody = await req.json();

  try {
    const jsonRpcProvider = new ethers.JsonRpcProvider(ETH_NET_URL);

    await jsonRpcProvider.broadcastTransaction(body.transactionSerialized);
  } catch (e) {
    let errorMessage = 'Cannot broadcast transaction right now, try again later';
    if (e instanceof Error && 'code' in e) {
      switch (e.code) {
        case 'INSUFFICIENT_FUNDS':
          errorMessage = 'You do not have enough funds to complete this transaction';
          break;
        case 'INVALID_ARGUMENT':
          errorMessage = 'Amount is too low';
          break;
        case 'REPLACEMENT_UNDERPRICED':
          errorMessage =
            'The previous transaction is still pending and has not been sealed, try again later';
          break;
      }
    }
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }

  return NextResponse.json({ message: 'success' }, { status: 200 });
}
