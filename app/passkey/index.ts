import { userInitPasskey } from '../user';

export const base64url = {
  encode: function (buffer: Iterable<number>): string {
    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  },
  decode: function (base64formatUrl: string): ArrayBufferLike {
    const base64 = base64formatUrl.replace(/-/g, '+').replace(/_/g, '/');
    const binStr = window.atob(base64);
    const bin = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bin[i] = binStr.charCodeAt(i);
    }
    return bin.buffer;
  },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function _fetch(path: string, payload: object = {}): Promise<any> {
  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
  };
  const payloadStr = JSON.stringify(payload);
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: headers,
    body: payloadStr,
  });
  if (!res.ok) {
    // Server authentication failed
    const result = await res.json();
    throw new Error(result.message);
  }
  // Server authentication succeeded
  return res.json();
}

export async function authenticate(conditional = false): Promise<void> {
  const options = await _fetch('api/passkey/signinRequest');

  // Base64URL decode the challenge
  options.challenge = base64url.decode(options.challenge);

  // `allowCredentials` empty array invokes an account selector by discoverable credentials.
  options.allowCredentials = [];

  // Invoke WebAuthn get
  const cred = (await navigator.credentials.get({
    publicKey: options,
    // Request a conditional UI
    mediation: conditional ? 'conditional' : 'optional',
  })) as PublicKeyCredential;

  const credential: {
    id?: string;
    rawId?: string;
    type?: string;
    response?: {
      clientDataJSON: string;
      authenticatorData: string;
      signature: string;
      userHandle: string;
    };
  } = {};
  if (!cred) {
    throw new Error('No credential returned');
  }
  credential.id = cred.id;
  credential.type = cred.type;
  // Base64URL encode `rawId`
  credential.rawId = base64url.encode(new Uint8Array(cred.rawId));

  // Base64URL encode some values
  const clientDataJSON = base64url.encode(new Uint8Array(cred.response.clientDataJSON));
  const authenticatorData = base64url.encode(
    new Uint8Array((cred.response as AuthenticatorAssertionResponse).authenticatorData),
  );
  const signature = base64url.encode(
    new Uint8Array((cred.response as AuthenticatorAssertionResponse).signature),
  );
  const userHandle = base64url.encode(
    new Uint8Array(
      (cred.response as AuthenticatorAssertionResponse).userHandle || new ArrayBuffer(0),
    ),
  );

  credential.response = {
    clientDataJSON,
    authenticatorData,
    signature,
    userHandle: '',
  };

  // Send the result to the server and return the promise.
  const res = await _fetch('api/passkey/signinResponse', credential);

  await userInitPasskey(userHandle, res.token);
}

export async function registerCredential(name: string): Promise<void> {
  const options = await _fetch('api/passkey/registerRequest');

  // Base64URL decode some values
  options.user.id = base64url.decode(
    base64url.encode(window.crypto.getRandomValues(new Uint8Array(32))),
  );

  options.challenge = base64url.decode(options.challenge);
  if (options.excludeCredentials) {
    for (const cred of options.excludeCredentials) {
      cred.id = base64url.decode(cred.id);
    }
  }

  options.user.name = name;
  options.user.displayName = name;
  // Use platform authenticator and discoverable credential
  options.authenticatorSelection = {
    authenticatorAttachment: 'platform',
    requireResidentKey: true,
  };

  const cred = (await navigator.credentials.create({
    publicKey: options,
  })) as PublicKeyCredential;

  if (!cred) {
    throw new Error('No credential returned');
  }

  const credential: {
    id?: string;
    rawId?: string;
    type?: string;
    authenticatorAttachment?: string;
    response?: {
      clientDataJSON: string;
      attestationObject: string;
      transports: string[];
    };
  } = {};
  credential.id = cred.id;
  // Base64URL encode `rawId`
  credential.rawId = base64url.encode(new Uint8Array(cred.rawId));
  credential.type = cred.type;

  // `authenticatorAttachment` in PublicKeyCredential is a new addition in WebAuthn L3
  if (cred.authenticatorAttachment) {
    credential.authenticatorAttachment = cred.authenticatorAttachment;
  }

  // Base64URL encode some values
  const clientDataJSON = base64url.encode(new Uint8Array(cred.response.clientDataJSON));
  const attestationObject = base64url.encode(
    new Uint8Array((cred.response as AuthenticatorAttestationResponse).attestationObject),
  );

  // Obtain transports if they are available.
  const transports = (cred.response as AuthenticatorAttestationResponse).getTransports
    ? (cred.response as AuthenticatorAttestationResponse).getTransports()
    : [];

  credential.response = {
    clientDataJSON,
    attestationObject,
    transports,
  };

  return await _fetch('api/passkey/registerResponse', credential);
}
