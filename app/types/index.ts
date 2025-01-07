export function isGoogleInfo(info: unknown): info is GoogleInfo {
  return (info as GoogleInfo).email !== undefined;
}

export function isPasskeyInfo(info: unknown): info is PasskeyInfo {
  return (info as PasskeyInfo).id !== undefined;
}

export interface GoogleInfo {
  email: string;
}

export interface PasskeyInfo {
  id: string;
}
