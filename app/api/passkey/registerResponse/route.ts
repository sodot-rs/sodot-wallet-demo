import { SessionData, sessionOptions } from '@/app/session';
import { prisma } from '@/app/utils';
import { ORIGIN, RP_ID } from '@/consts';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { UserAgent } from 'express-useragent';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const userAgentHeader = req.headers.get('user-agent') || '';
  const ua = new UserAgent().parse(userAgentHeader);

  const platform = ua.platform;
  const credential = await req.json();

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const expectedChallenge = session.challenge;
  if (!expectedChallenge) {
    throw new Error('No challenge found');
  }

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: false,
  });

  const { verified, registrationInfo } = verification;

  if (!verified) {
    throw new Error('User verification failed.');
  }

  if (!registrationInfo) {
    throw new Error('No registration info found.');
  }
  const credentialPublicKey = registrationInfo.credential.publicKey;
  const credentialID = new Uint8Array(isoBase64URL.toBuffer(registrationInfo.credential.id));

  // Base64URL encode ArrayBuffers.
  const base64PublicKey = isoBase64URL.fromBuffer(credentialPublicKey);
  const base64CredentialID = isoBase64URL.fromBuffer(credentialID);
  try {
    await prisma.passkeyUser.create({
      data: {
        id: base64CredentialID,
        publicKey: base64PublicKey,
        name: platform,
        transports: JSON.stringify(credential.response.transports),
        registered: new Date().getTime(),
        last_used: null,
        encryptedShares: JSON.stringify(null),
        counter: 0,
        keyId: '',
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'DB does not exist. Please run "npm run db::init" to initialize it.' },
      { status: 500 },
    );
  }

  session.challenge = null;
  await session.save();
  return NextResponse.json({ message: 'success' }, { status: 200 });
}
