import { SessionData, sessionOptions } from '@/app/session';
import { prisma, utilsCreateCredentials } from '@/app/utils';
import { ORIGIN, RP_ID } from '@/consts';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const credential = await req.json();
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  const expectedChallenge = session.challenge;
  if (!expectedChallenge) {
    throw new Error('No challenge found');
  }

  let passkeyUser;
  try {
    passkeyUser = await prisma.passkeyUser.findUnique({
      where: { id: credential.id },
    });
  } catch {
    return NextResponse.json(
      { message: 'DB does not exist. Please run "npm run db::init" to initialize it.' },
      { status: 500 },
    );
  }
  if (!passkeyUser) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  const authenticator = {
    credentialPublicKey: isoBase64URL.toBuffer(passkeyUser.publicKey),
    credentialID: isoBase64URL.toBuffer(passkeyUser.id),
    transports: JSON.parse(passkeyUser.transports),
  };

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      publicKey: isoBase64URL.toBuffer(passkeyUser.publicKey),
      id: passkeyUser.id,
      transports: authenticator.transports,
      counter: passkeyUser.counter,
    },
    requireUserVerification: false,
  });

  const { verified, authenticationInfo } = verification;
  if (!verified) {
    throw new Error('User verification failed.');
  }
  passkeyUser.last_used = BigInt(new Date().getTime());
  passkeyUser.counter = authenticationInfo.newCounter;
  await prisma.passkeyUser.update({
    where: { id: passkeyUser.id },
    data: { last_used: passkeyUser.last_used },
  });

  session.challenge = null;
  await session.save();

  const jwtToken = utilsCreateCredentials({ id: credential.id });
  return NextResponse.json({ token: jwtToken }, { status: 200 });
}
