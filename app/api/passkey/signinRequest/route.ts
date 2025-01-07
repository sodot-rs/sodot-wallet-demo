import { SessionData, sessionOptions } from '@/app/session';
import { RP_ID } from '@/consts';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  try {
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: [],
    });
    session.challenge = options.challenge;
    await session.save(); // Persist the session data

    return NextResponse.json(options, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
