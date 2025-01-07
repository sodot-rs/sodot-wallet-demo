'use client';

import {
  GOOGLE_AUTH_CLIENT_ID,
  GOOGLE_AUTH_CLIENT_SECRET,
  GOOGLE_AUTH_REDIRECT_URI,
} from '@/consts';
import googleIcon from '@/public/googleIcon.png';
import { Center } from '@mantine/core';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import { ReactElement, useState } from 'react';

import Alert from './alert';
import Button from './button';
import Card from './card';

export default function GoogleLoginComponent({
  onSuccess,
}: {
  onSuccess: (_accessTokenDrive: string, _accessTokenProfile: string) => void;
}): ReactElement {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_AUTH_CLIENT_ID}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Login onLoginSuccess={onSuccess} />
      </div>
    </GoogleOAuthProvider>
  );
}

/**
we need to get 2 access tokens - one for drive and one for profile.
why? because we got only one access token and sent it to the server,
the server would have access to the user's google drive.
by adding the second token the server can still verify the user
but without the ability to access the user's google drive.
*/

//getting the access token from the code (received from the google login)
const getAccessTokenWithCode = async (code: string, scope: string) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      client_id: GOOGLE_AUTH_CLIENT_ID,
      client_secret: GOOGLE_AUTH_CLIENT_SECRET,
      redirect_uri: GOOGLE_AUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
      scope, // Include or exclude scope
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch access token');
  }

  return response.json();
};

//getting the access token from the refresh token (received from the first token)
const getAccessTokenWithRefreshToken = async (refreshToken: string, scope: string) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GOOGLE_AUTH_CLIENT_ID,
      client_secret: GOOGLE_AUTH_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope, // Optional, include the desired scope
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch access token');
  }

  return response.json();
};

function Login({
  onLoginSuccess: onGoogleLoginSuccess,
}: {
  onLoginSuccess: (_accessTokenDrive: string, _accessTokenProfile: string) => void;
}) {
  const [error, setError] = useState<string>('');

  const googleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    flow: 'auth-code',

    onSuccess: async (codeResponse) => {
      //google drive token that will be used to access the user's google drive (client side)
      const tokenResponseDrive = await getAccessTokenWithCode(
        codeResponse.code,
        'https://www.googleapis.com/auth/drive.appdata',
      );

      //google profile token that will be used to access the user's google profile
      // (server side - user verification)
      const tokenResponseProfile = await getAccessTokenWithRefreshToken(
        tokenResponseDrive.refresh_token,
        'https://www.googleapis.com/auth/userinfo.profile ' +
          'openid https://www.googleapis.com/auth/userinfo.email',
      );

      onGoogleLoginSuccess(tokenResponseDrive.access_token, tokenResponseProfile.access_token);
    },
    onError: (e) => {
      if (e.error !== 'access_denied') {
        setError('Error: failed to login');
      }
    },
  });

  return (
    <div>
      <Card>
        <span className='flex items-center justify-between gap-2 w-full'>
          <div className='text-left'>Google</div>
          <Image src={googleIcon} width={32} height={32} alt='Google Icon' />
        </span>
        <Center>
          <Button
            onClick={() => {
              googleLogin();
            }}
          >
            Sign In
          </Button>
        </Center>
      </Card>
      <Alert message={error} setMessage={setError}></Alert>
    </div>
  );
}
