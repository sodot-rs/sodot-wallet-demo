import { SessionOptions } from 'iron-session';

export interface SessionData {
  username: string;
  isLoggedIn: boolean;
  challenge: string | null;
}

export const defaultSession: SessionData = {
  username: '',
  isLoggedIn: false,
  challenge: '',
};

export const sessionOptions: SessionOptions = {
  password: 'complex_password_at_least_32_characters_long',
  cookieName: 'sodot-session',
  cookieOptions: {
    secure: true,
  },
};
