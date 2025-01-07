import { SessionData, sessionOptions } from '@/app/session';
import { RP_ID, RP_NAME } from '@/consts';
import { AuthenticatorAttachment, generateRegistrationOptions } from '@simplewebauthn/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  // Create `excludeCredentials` from a list of stored credentials.
  const excludeCredentials: { id: string; type: string }[] = [];
  // Set `authenticatorSelection`.
  const authenticatorAttachment: AuthenticatorAttachment = 'platform';
  const requireResidentKey = true;
  const authenticatorSelection = {
    authenticatorAttachment,
    requireResidentKey,
  };
  const attestationType = 'none';
  const options = await generateRegistrationOptions({
    rpID: RP_ID,
    rpName: RP_NAME,
    userID: new Uint8Array(), //set by client
    userName: '', //set by client
    userDisplayName: '', //set by client
    attestationType,
    excludeCredentials,
    authenticatorSelection,
  });

  session.challenge = options.challenge;
  await session.save();
  return NextResponse.json(options, { status: 200 });
}
