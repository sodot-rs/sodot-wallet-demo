// General MPC parameters
export const N = 2;
export const T = 2;
export const RELAY_URL = 'demo.sodot.dev';
export const DERIVATION_PATH = [44, 60, 0, 0, 0];

// To be used in the server
export const VERTEX_URL = process.env.VERTEX_URL || '';
export const VERTEX_API_KEY = process.env.SERVER_API_KEY || '';
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const ETH_NET_URL = process.env.ETH_NET_URL || '';
export const RP_NAME = process.env.RP_NAME || '';
export const RP_ID = process.env.RP_ID || '';
export const ORIGIN = process.env.ORIGIN || '';

// To be used in the client
export const GOOGLE_AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID || '';
export const GOOGLE_AUTH_CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_SECRET || '';
export const GOOGLE_AUTH_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URI || '';

// other useful information
export const GITHUB_REPO = 'https://github.com/sodot-rs/sodot-wallet-demo';
export const SODOT_WEBSITE = 'https://sodot.dev';
